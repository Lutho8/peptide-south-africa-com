
create policy "pets_waitlist_no_direct_access"
on public.psa_pets_waitlist
as restrictive
for all
to anon, authenticated
using (false)
with check (false);

create index if not exists psa_pets_launch_box_waitlist_id_idx
on public.psa_pets_launch_box(waitlist_id);
;
