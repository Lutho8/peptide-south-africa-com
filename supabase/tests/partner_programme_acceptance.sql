-- Run only in an isolated synthetic database. No real payments or personal data.
begin;
select set_config('request.jwt.claim.role','service_role',true);
update public.partner_programmes set financial_activation=true where programme_key='wellness_b2b';
create temp table journey_ids(kind text,usr uuid,enrolment uuid,ord uuid);
do $$
declare kind text; uid uuid; app uuid; enr uuid; oid uuid; pol text; n bigint;
begin
 foreach kind in array array['facility','creator','hybrid','legacy'] loop
 uid:=gen_random_uuid(); oid:=gen_random_uuid();
 insert into auth.users(id,email,email_confirmed_at) values(uid,kind||'@example.invalid',now());
 if kind='legacy' then
 insert into public.psa_ambassadors(first_name,ambassador_id,referral_code,status,commission_rate) values('Synthetic','legacy-fixture','QALEGACY','active',20) returning id into n;
 insert into public.partner_accounts(auth_user_id,holder_kind,public_name,legacy_ambassador_id) values(uid,'individual','Synthetic legacy',n) returning id into app;
 insert into public.partner_enrolments(programme_id,partner_account_id,status,partner_types,referral_code,commission_rate_bps) select id,app,'approved',array['creator'],'QALEGACY',2000 from public.partner_programmes where programme_key='wellness_b2b' returning id into enr;
 else
 app:=public.submit_partner_application_v2(jsonb_build_object('email',kind||'@example.invalid','contact_name','Synthetic partner','partner_types',case when kind='hybrid' then '["facility","creator"]'::jsonb else jsonb_build_array(kind) end));
 enr:=public.approve_partner_application(app,uid,'QA'||upper(kind));
 end if;
 perform set_config('request.jwt.claim.sub',uid::text,true);
 perform public.accept_partner_agreement(enr);
 perform public.create_partner_campaign(enr,'fixture','Synthetic campaign','website');
 insert into public.orders(id,user_id,total) values(oid,uid,1000);
 insert into public.psa_orders(order_id,payment_status,payment_method) values(oid::text,'awaiting_eft','eft_capitec');
 perform public.freeze_partner_attribution(oid,'wellness_b2b','QA'||upper(kind),'fixture','entered_code','main',100000,'wellness-b2b-v2.0-2026-10-27');
 if exists(select 1 from public.partner_commission_ledger where order_id=oid) then raise exception 'Unpaid order earned'; end if;
 update public.psa_orders set payment_status='complete' where order_id=oid::text;
 update public.psa_orders set payment_status='complete' where order_id=oid::text;
 select sum(amount_cents) into n from public.partner_commission_ledger where order_id=oid;
 if n<>20000 then raise exception 'Expected R200 for %, got %',kind,n; end if;
 if (select count(*) from public.partner_commission_ledger where order_id=oid)<>1 then raise exception 'Duplicate commission'; end if;
 insert into journey_ids values(kind,uid,enr,oid);
 end loop;
end $$;
-- Server-enforced attribution boundary and professional review.
do $$
declare enr uuid; uid uuid; oid uuid; clk uuid; app uuid;
begin
 select enrolment,usr into enr,uid from journey_ids where kind='creator';
 insert into public.partner_referral_clicks(programme_id,enrolment_id,referral_code,campaign_key,method,created_at,expires_at)
 select programme_id,enr,'QACREATOR','fixture','qr',now()-interval '30 days',now() from public.partner_enrolments where id=enr returning id into clk;
 oid:=gen_random_uuid(); insert into public.orders(id,user_id,total) values(oid,uid,1000);
 begin perform public.freeze_partner_attribution(oid,'wellness_b2b','QACREATOR','fixture','qr','main',100000,'wellness-b2b-v2.0-2026-10-27',clk); raise exception 'Expired click accepted'; exception when raise_exception then if sqlerrm not like 'Expired or invalid click%' then raise; end if; end;
 update public.partner_referral_clicks set created_at=now(),expires_at=now()+interval '30 days' where id=clk;
 perform public.freeze_partner_attribution(oid,'wellness_b2b','QACREATOR','fixture','qr','main',100000,'wellness-b2b-v2.0-2026-10-27',clk);
 if not exists(select 1 from public.partner_order_attributions where order_id=oid and click_id=clk and enrolment_id=enr) then raise exception 'QR attribution incorrect'; end if;
 begin perform public.freeze_partner_attribution(gen_random_uuid(),'wellness_b2b','QACREATOR',null,'entered_code','pets',100000,'wellness-b2b-v2.0-2026-10-27'); raise exception 'Pets origin allowed'; exception when raise_exception then if sqlerrm not like 'programme/storefront mismatch%' then raise; end if; end;
 app:=public.submit_partner_application_v2(jsonb_build_object('email','professional@example.invalid','contact_name','Synthetic professional','partner_types','["creator"]'::jsonb,'regulated_professional',true));
 begin perform public.approve_partner_application(app,uid,'QAPRO'); raise exception 'Professional bypass accepted'; exception when raise_exception then if sqlerrm not like 'Professional clearance required%' then raise; end if; end;
end $$;
-- RLS actual-role tests: another partner and Pets cannot be read; writes denied.
select set_config('request.jwt.claim.sub',(select usr::text from journey_ids where kind='facility'),true);
set local role authenticated;
do $$ begin
 if (select count(*) from public.partner_enrolments)<>1 then raise exception 'Cross-partner enrolment disclosure'; end if;
 if (select count(*) from public.partner_commission_ledger)<>1 then raise exception 'Cross-partner ledger disclosure'; end if;
 begin insert into public.partner_commission_ledger(programme_id) values(gen_random_uuid()); raise exception 'Financial write permitted'; exception when insufficient_privilege then null; end;
 begin perform public.release_partner_commissions(); raise exception 'Financial RPC permitted'; exception when insufficient_privilege then null; end;
end $$;
reset role;
-- Validation, proportional refund, replay, carry forward, reservation and paid evidence.
do $$
declare enr uuid; oid uuid; stmt uuid; n bigint;
begin
 select enrolment,ord into enr,oid from journey_ids where kind='facility';
 perform public.release_partner_commissions();
 if (select status from public.partner_commission_ledger where order_id=oid)<>'pending_validation' then raise exception 'Early release'; end if;
 perform public.adjust_partner_refund(oid,25000,'fixture-refund');
 perform public.adjust_partner_refund(oid,25000,'fixture-refund');
 if (select sum(amount_cents) from public.partner_commission_ledger where order_id=oid)<>15000 then raise exception 'Refund or replay incorrect'; end if;
 update public.partner_commission_ledger set created_at=now()-interval '15 days' where event_type='commission';
 perform public.release_partner_commissions();
 if exists(select 1 from public.partner_commission_ledger where order_id=oid and status='pending_validation') then raise exception 'Refund adjustment did not release with original'; end if;
 begin perform public.prepare_partner_payout(enr,'2026-09-01','2026-09-30'); raise exception 'Below minimum payout allowed'; exception when raise_exception then if sqlerrm not like 'Available balance below%' then raise; end if; end;
 -- Three additional synthetic earned commissions supply threshold, through real settlement trigger.
 for n in 1..3 loop
 oid:=gen_random_uuid(); insert into public.orders(id,user_id,total) select oid,usr,1000 from journey_ids where kind='facility';
 insert into public.psa_orders(order_id,payment_status,payment_method) values(oid::text,'awaiting_eft','eft_capitec');
 perform public.freeze_partner_attribution(oid,'wellness_b2b','QAFACILITY',null,'entered_code','main',100000,'wellness-b2b-v2.0-2026-10-27');
 update public.psa_orders set payment_status='complete' where order_id=oid::text;
 end loop;
 update public.partner_commission_ledger set created_at=now()-interval '15 days';
 stmt:=public.prepare_partner_payout(enr,'2026-09-01','2026-09-30');
 if (select amount_cents from public.partner_payout_statements where id=stmt)<>75000 then raise exception 'Statement incorrect'; end if;
 if public.prepare_partner_payout(enr,'2026-09-01','2026-09-30')<>stmt then raise exception 'Duplicate statement'; end if;
 perform public.cancel_partner_payout(stmt,true);
 if exists(select 1 from public.partner_commission_ledger where statement_id=stmt) then raise exception 'Failed payout retained reserved entries'; end if;
 if public.prepare_partner_payout(enr,'2026-09-01','2026-09-30')<>stmt then raise exception 'Retry duplicated statement'; end if;
 if (select status from public.partner_payout_statements where id=stmt)<>'reserved' then raise exception 'Failed statement not reserved on retry'; end if;
 begin perform public.confirm_partner_payout(stmt,null); raise exception 'Null reference accepted'; exception when raise_exception then if sqlerrm not like 'Reserved statement%' then raise; end if; end;
 perform public.confirm_partner_payout(stmt,'SYNTHETIC-NO-MONEY-MOVED');
 perform public.confirm_partner_payout(stmt,'SYNTHETIC-NO-MONEY-MOVED');
 if (select sum(amount_cents) from public.partner_commission_ledger where enrolment_id=enr and status='paid')<>75000 then raise exception 'Paid ledger incorrect'; end if;
end $$;
select 'PASS: four R1000→R200 journeys, replay, ownership RLS, financial ACL, 14-day validation, partial refund, R500 threshold, monthly payout statement and paid evidence' as acceptance_result;
rollback;
