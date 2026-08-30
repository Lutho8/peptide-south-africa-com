-- Private fulfilment data for EFT orders. This table is intentionally absent
-- from anon/authenticated grants and is written only by the service-role order
-- boundary after the server has priced and created the order.
create table public.order_fulfilment_details (
  order_id uuid primary key references public.orders(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  storefront text not null check (storefront in ('main', 'pets')),
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  address_line_1 text not null,
  city text not null,
  province text not null,
  postal_code text not null,
  pet_name text,
  pet_species text check (pet_species is null or pet_species in ('dog', 'cat', 'horse')),
  created_at timestamptz not null default now()
);

alter table public.order_fulfilment_details enable row level security;
revoke all on table public.order_fulfilment_details from anon, authenticated, public;
grant all on table public.order_fulfilment_details to service_role;

create index order_fulfilment_details_user_created_idx
  on public.order_fulfilment_details (user_id, created_at desc);
