-- Isolated synthetic database only. All values, users and bank references are fixtures.
begin;

select set_config('request.jwt.claim.role','service_role',true);
insert into public.partner_programmes(programme_key,name,storefront,accepting_applications,financial_activation)
values('wellness_b2b','Synthetic wellness','main',true,true),('pets_b2b','Synthetic pets','pets',true,false)
on conflict(programme_key) do update set accepting_applications=true;
update public.partner_policies set active=false;
insert into public.partner_policies(programme_id,policy_version,commission_rate_bps,attribution_window_days,validation_days,minimum_payout_cents,payout_frequency,repeat_order_rule,code_precedence,active,approved_at,terms_sha256)
select id,'synthetic-only-'||programme_key,2000,30,14,50000,'monthly_zar_eft','fresh_attribution_required','entered_code_over_latest_click',true,now(),repeat('a',64)
from public.partner_programmes;
insert into public.partner_product_eligibility(programme_id,product_slug,eligible,approved_at,policy_version)
select id,'pets-bpc-157',true,now(),'synthetic-only-pets_b2b' from public.partner_programmes where programme_key='pets_b2b';
update public.partner_programmes set financial_activation=true where programme_key='pets_b2b';
create temp table pet_ids(usr uuid,enrolment uuid,wellness uuid,ord uuid);
do $$
declare uid uuid:=gen_random_uuid(); app uuid; e uuid; w uuid; oid uuid:=gen_random_uuid(); n bigint;
begin
 insert into auth.users(id,email,email_confirmed_at) values(uid,'pet-business@example.invalid',now());
 app:=public.submit_pets_partner_application('{"email":"pet-business@example.invalid","contact_name":"Synthetic partner","facility_name":"Synthetic grooming","facility_type":"pet_groomer","terms_accepted":true}'::jsonb);
 e:=public.approve_partner_application(app,uid,'PETS-QA1');
 app:=public.submit_partner_application_v2('{"email":"pet-business@example.invalid","contact_name":"Synthetic partner","partner_types":["facility"]}'::jsonb);
 w:=public.approve_partner_application(app,uid,'WELLQA');
 if (select count(*) from public.partner_accounts where auth_user_id=uid)<>1 then raise exception 'Dual enrolment duplicated financial identity'; end if;
 perform set_config('request.jwt.claim.sub',uid::text,true);
 perform public.accept_partner_agreement(e); perform public.accept_partner_agreement(w);
 insert into public.orders(id,user_id,total,order_items) values(oid,uid,1395,'[{"slug":"pets-bpc-157","line_total":1000,"storefront":"pets.peptide-south-africa.com"},{"slug":"pets-mobility-collagen","line_total":395,"storefront":"pets.peptide-south-africa.com"}]');
 insert into public.psa_pets_order_details(order_id,user_id,pet_name,pet_species) values(oid,uid,'Synthetic pet','dog');
 begin perform public.freeze_partner_attribution(oid,'wellness_b2b','WELLQA',null,'entered_code','main',139500,'synthetic-only-wellness_b2b'); raise exception 'Cross programme allowed'; exception when raise_exception then if sqlerrm<>'Order/storefront mismatch' then raise; end if; end;
 begin perform public.freeze_partner_attribution(oid,'pets_b2b','WELLQA',null,'entered_code','pets',139500,'synthetic-only-pets_b2b'); raise exception 'Wellness code allowed'; exception when raise_exception then if sqlerrm<>'invalid partner code' then raise; end if; end;
 begin perform public.freeze_partner_attribution(oid,'pets_b2b','PETS-QA1',null,'qr','pets',139500,'synthetic-only-pets_b2b'); raise exception 'Forged click allowed'; exception when raise_exception then if sqlerrm<>'Expired or invalid click' then raise; end if; end;
 perform public.freeze_partner_attribution(oid,'pets_b2b','PETS-QA1',null,'entered_code','pets',139500,'synthetic-only-pets_b2b');
 if (select commissionable_value_cents from public.partner_order_attributions where order_id=oid)<>100000 then raise exception 'Ineligible collagen included'; end if;
 if (select validation_days from public.partner_order_attributions where order_id=oid)<>14 then raise exception 'Pets inherited wellness validation'; end if;
 insert into public.psa_orders(order_id,order_total,payment_status,payment_method) values(oid::text,1395,'awaiting_eft','eft_capitec');
 if exists(select 1 from public.partner_commission_ledger where order_id=oid) then raise exception 'Unpaid earned'; end if;
 update public.psa_orders set payment_status='complete' where order_id=oid::text;
 update public.psa_orders set payment_status='complete' where order_id=oid::text;
 select sum(amount_cents) into n from public.partner_commission_ledger where order_id=oid;
 if n<>20000 or (select count(*) from public.partner_commission_ledger where order_id=oid)<>1 then raise exception 'Settlement/replay wrong'; end if;
 perform public.adjust_partner_refund(oid,20000,'synthetic-pets-refund');
 perform public.adjust_partner_refund(oid,20000,'synthetic-pets-refund');
 if (select sum(amount_cents) from public.partner_commission_ledger where order_id=oid)<>16000 then raise exception 'Expected R40 adjustment and R160 net'; end if;
 perform public.release_partner_commissions();
 if exists(select 1 from public.partner_commission_ledger where order_id=oid and status<>'pending_validation') then raise exception 'Early release'; end if;
 update public.partner_commission_ledger set created_at=now()-interval '15 days' where order_id=oid;
 perform public.release_partner_commissions();
 if exists(select 1 from public.partner_commission_ledger where order_id=oid and status<>'available') then raise exception 'Independent 14-day release failed'; end if;
 begin perform public.prepare_partner_payout(e,'2026-09-01','2026-09-30'); raise exception 'Below minimum payout permitted'; exception when raise_exception then if sqlerrm not like 'Available balance below%' then raise; end if; end;
 insert into pet_ids values(uid,e,w,oid);
end $$;
-- Professional disclosures survive intake and cannot bypass staff clearance.
do $$
declare uid uuid:=gen_random_uuid(); app uuid; e uuid;
begin
 insert into auth.users(id,email,email_confirmed_at) values(uid,'professional@example.invalid',now());
 app:=public.submit_pets_partner_application('{"email":"professional@example.invalid","contact_name":"Synthetic professional","facility_name":"Synthetic business","facility_type":"other_pet_business","terms_accepted":true,"regulated_professional":true}'::jsonb);
 if not (select regulated_professional and professional_review_status='required' from public.partner_applications_v2 where id=app) then raise exception 'Professional flag lost'; end if;
 begin perform public.approve_partner_application(app,uid,'PETS-PRO'); raise exception 'Professional bypass'; exception when raise_exception then if sqlerrm<>'Professional clearance required' then raise; end if; end;
 begin perform public.approve_partner_application(app,uid,'WRONG-CODE',true); raise exception 'Wrong Pets prefix'; exception when raise_exception then if sqlerrm not like 'Pets code must begin%' then raise; end if; end;
 e:=public.approve_partner_application(app,uid,'PETS-PRO',true);
 perform set_config('request.jwt.claim.sub',uid::text,true);
 perform public.accept_partner_agreement(e);
 begin perform public.freeze_partner_attribution((select ord from pet_ids),'pets_b2b','PETS-PRO',null,'entered_code','pets',100000,'synthetic-only-pets_b2b'); raise exception 'Frozen attribution reassigned'; exception when raise_exception then if sqlerrm<>'Order attribution already frozen' then raise; end if; end;
end $$;
-- A second cleared order reaches the shared payout minimum; reservation is idempotent.
do $$
declare e uuid; uid uuid; oid uuid:=gen_random_uuid(); stmt uuid;
begin
 select enrolment,usr into e,uid from pet_ids;
 if exists(select 1 from public.partner_policies p join public.partner_policies w on w.policy_version='synthetic-only-wellness_b2b' where p.policy_version='synthetic-only-pets_b2b' and (p.commission_rate_bps,p.attribution_window_days,p.validation_days,p.minimum_payout_cents,p.payout_frequency,p.repeat_order_rule,p.code_precedence,p.customer_discount_bps,p.tier_rules) is distinct from (w.commission_rate_bps,w.attribution_window_days,w.validation_days,w.minimum_payout_cents,w.payout_frequency,w.repeat_order_rule,w.code_precedence,w.customer_discount_bps,w.tier_rules)) then raise exception 'Commercial policy mismatch'; end if;
 begin update public.partner_policies set commission_rate_bps=2500 where policy_version='synthetic-only-pets_b2b'; raise exception 'Unapproved tier allowed'; exception when raise_exception then if sqlerrm<>'Partner commercial rules must match the approved founding policy' then raise; end if; end;
 insert into public.orders(id,user_id,total,order_items) values(oid,uid,3000,'[{"slug":"pets-bpc-157","line_total":3000,"storefront":"pets.peptide-south-africa.com"}]');
 insert into public.psa_pets_order_details(order_id,user_id,pet_name,pet_species) values(oid,uid,'Synthetic','dog');
 perform public.freeze_partner_attribution(oid,'pets_b2b','PETS-QA1',null,'entered_code','pets',1,'synthetic-only-pets_b2b');
 insert into public.psa_orders(order_id,order_total,payment_status,payment_method) values(oid::text,3000,'awaiting_eft','eft_capitec');
 if exists(select 1 from public.partner_commission_ledger where order_id=oid) then raise exception 'Unverified payment earned'; end if;
 update public.psa_orders set payment_status='complete' where order_id=oid::text;
 update public.partner_commission_ledger set created_at=now()-interval '15 days' where order_id=oid;
 perform public.release_partner_commissions();
 stmt:=public.prepare_partner_payout(e,'2026-09-01','2026-09-30');
 if public.prepare_partner_payout(e,'2026-09-01','2026-09-30')<>stmt then raise exception 'Duplicate payout statement'; end if;
 if (select amount_cents from public.partner_payout_statements where id=stmt)<>76000 or (select sum(amount_cents) from public.partner_commission_ledger where statement_id=stmt)<>76000 then raise exception 'Payout reconciliation mismatch'; end if;
 begin perform public.adjust_partner_refund(oid,10000,'reserved-pets-refund'); raise exception 'Reserved refund permitted'; exception when raise_exception then if sqlerrm<>'Cancel reserved statement before refund adjustment' then raise; end if; end;
end $$;
-- Anonymous and unrelated authenticated users cannot read ledger or invoke staff finance.
select set_config('request.jwt.claim.sub',gen_random_uuid()::text,true);
set local role authenticated;
do $$ begin
 if exists(select 1 from public.partner_enrolments) or exists(select 1 from public.partner_commission_ledger) then raise exception 'Unrelated partner disclosure'; end if;
 begin perform public.submit_pets_partner_application('{}'); raise exception 'Public staff API permitted'; exception when insufficient_privilege then null; end;
 begin perform public.adjust_partner_refund(gen_random_uuid(),0,'test'); raise exception 'Public refund permitted'; exception when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub',(select usr::text from pet_ids),true);
set local role authenticated;
do $$ begin
 if (select count(*) from public.partner_enrolments)<>2 then raise exception 'Dual programme ownership broken'; end if;
 if (select sum(amount_cents) from public.partner_commission_ledger)<>76000 then raise exception 'Dashboard ledger mismatch'; end if;
 if exists(select 1 from public.partner_commission_ledger l join public.partner_programmes p on p.id=l.programme_id where p.programme_key='wellness_b2b') then raise exception 'Pets earnings leaked to wellness'; end if;
end $$;
reset role;
select 'PASS Pets: dual enrolment; programme/code/order isolation; forged click denied; R1000 eligible + excluded collagen -> R0 unpaid -> R200 settled/replayed -> R40 refund; matching 14-day release/R500 threshold; owner dashboard and finance ACL; identical commercial policy; R760 reserved statement reconciliation/replay' as acceptance_result;
rollback;
