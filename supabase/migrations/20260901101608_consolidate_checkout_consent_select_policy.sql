-- A single permissive SELECT policy avoids evaluating two policies for every
-- consent receipt while preserving owner and administrator access.

drop policy if exists "checkout_consents_select_own" on public.checkout_consents;
drop policy if exists "checkout_consents_admin_select" on public.checkout_consents;

create policy "checkout_consents_select" on public.checkout_consents
  for select to authenticated
  using (
    (select auth.uid()) = user_id
    or (select public.has_role((select auth.uid()), 'admin'))
  );
