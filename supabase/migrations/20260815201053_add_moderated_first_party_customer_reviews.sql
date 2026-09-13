
create table if not exists public.customer_reviews (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(btrim(display_name)) between 2 and 80),
  email text not null check (
    char_length(email) <= 320
    and email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ),
  location text check (location is null or char_length(location) <= 100),
  rating integer not null check (rating between 1 and 5),
  review text not null check (char_length(btrim(review)) between 20 and 2000),
  product_type text check (product_type is null or char_length(product_type) <= 120),
  order_ref text check (order_ref is null or char_length(order_ref) <= 80),
  consent_publish boolean not null default false,
  status text not null default 'pending'
    check (status in ('pending', 'published', 'rejected')),
  verified_purchase boolean not null default false,
  created_at timestamptz not null default now(),
  published_at timestamptz
);

alter table public.customer_reviews enable row level security;

create policy "Anyone may submit a pending review"
on public.customer_reviews
for insert
to anon, authenticated
with check (
  status = 'pending'
  and verified_purchase = false
  and consent_publish = true
);

create policy "Anyone may read published reviews"
on public.customer_reviews
for select
to anon, authenticated
using (status = 'published' and consent_publish = true);

create policy "Admins manage customer reviews"
on public.customer_reviews
for all
to authenticated
using ((select public.has_role((select auth.uid()), 'admin'::public.app_role)))
with check ((select public.has_role((select auth.uid()), 'admin'::public.app_role)));

revoke all on table public.customer_reviews from anon, authenticated;
grant insert (
  display_name, email, location, rating, review, product_type, order_ref, consent_publish
) on table public.customer_reviews to anon, authenticated;
grant select (
  id, display_name, location, rating, review, product_type,
  verified_purchase, created_at, published_at
) on table public.customer_reviews to anon, authenticated;
grant update, delete on table public.customer_reviews to authenticated;

create index if not exists customer_reviews_published_idx
on public.customer_reviews (published_at desc)
where status = 'published' and consent_publish = true;

comment on table public.customer_reviews is
  'First-party customer review submissions. Public UI shows published rows only; verified_purchase is set only after internal order checks.';
;
