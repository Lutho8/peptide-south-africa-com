-- Apply after the structural migration and successful acceptance gates.
-- Founder authorization: event 8d333d689994d104b81a5f6a6b7e81271d0e9a3116ce61de78a5d6174a3eb469.
-- This prepares an approved policy; financial activation remains a separate final gate.
begin;
insert into public.partner_policies(programme_id,policy_version,commission_rate_bps,attribution_window_days,validation_days,minimum_payout_cents,payout_frequency,repeat_order_rule,code_precedence,customer_discount_bps,active,approved_at,terms_sha256)
select pets.id,'pets-b2b-v1.0-2026-10-28',w.commission_rate_bps,w.attribution_window_days,w.validation_days,w.minimum_payout_cents,w.payout_frequency,w.repeat_order_rule,w.code_precedence,w.customer_discount_bps,true,now(),'9d1c2c9cd2734bc3c6e10df6680ce26ac48c301ba37f3dbd120855dd167fcb1d'
from public.partner_programmes pets cross join public.partner_policies w join public.partner_programmes main on main.id=w.programme_id
where pets.programme_key='pets_b2b' and main.programme_key='wellness_b2b' and w.active and w.approved_at is not null
on conflict(programme_id,policy_version) do nothing;
-- Refuse a missing source policy or a conflicting existing version instead of
-- silently launching a stale policy after ON CONFLICT.
do $$
begin
 if not exists (
  select 1 from public.partner_policies p join public.partner_programmes pets on pets.id=p.programme_id
  cross join public.partner_policies w join public.partner_programmes main on main.id=w.programme_id
  where pets.programme_key='pets_b2b' and main.programme_key='wellness_b2b'
  and p.policy_version='pets-b2b-v1.0-2026-10-28' and p.active and p.approved_at is not null
  and w.active and w.approved_at is not null
  and p.terms_sha256='9d1c2c9cd2734bc3c6e10df6680ce26ac48c301ba37f3dbd120855dd167fcb1d'
  and (p.commission_rate_bps,p.attribution_window_days,p.validation_days,p.minimum_payout_cents,p.payout_frequency,p.repeat_order_rule,p.code_precedence,p.customer_discount_bps,p.tier_rules)
   is not distinct from
   (w.commission_rate_bps,w.attribution_window_days,w.validation_days,w.minimum_payout_cents,w.payout_frequency,w.repeat_order_rule,w.code_precedence,w.customer_discount_bps,w.tier_rules)
 ) then raise exception 'Approved Pets policy must exactly match the active main policy and agreement hash'; end if;
end $$;
insert into public.partner_product_eligibility(programme_id,product_slug,eligible,approved_at,policy_version)
select id,slug,true,now(),'pets-b2b-v1.0-2026-10-28' from public.partner_programmes cross join unnest(array['pets-bpc-157','pets-kpv','pets-recovery-blend','pets-immune-thymogen']) slug where programme_key='pets_b2b'
on conflict(programme_id,product_slug,policy_version) do nothing;
commit;
