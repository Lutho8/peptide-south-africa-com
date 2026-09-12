-- PSA PETS: waitlist + launch box reservations
create table if not exists public.psa_pets_waitlist (
  id uuid primary key default gen_random_uuid(),
  ticket_code text unique not null,
  owner_name text not null,
  email text not null,
  whatsapp text,
  pet_type text,
  pet_breed text,
  pet_age integer,
  city text,
  products jsonb not null default '[]'::jsonb,
  primary_concern text,
  referral_code text,
  referred_by text,
  source text not null default 'pets-landing',
  locale text not null default 'en',
  consent_popia boolean not null default false,
  utm jsonb not null default '{}'::jsonb,
  quiz_answers jsonb,
  created_at timestamptz not null default now()
);
create unique index if not exists psa_pets_waitlist_email_pet_idx
  on public.psa_pets_waitlist (lower(email), coalesce(pet_breed,''), coalesce(pet_type,''));

create table if not exists public.psa_pets_launch_box (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  waitlist_id uuid references public.psa_pets_waitlist(id) on delete set null,
  items jsonb not null default '[]'::jsonb,
  subtotal_zar numeric not null default 0,
  founding_discount_pct numeric not null default 20,
  status text not null default 'reserved' check (status in ('reserved','converted','expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.psa_pets_waitlist enable row level security;
alter table public.psa_pets_launch_box enable row level security;

-- Public (anon) may ONLY insert; no select/update/delete
drop policy if exists pets_waitlist_insert on public.psa_pets_waitlist;
create policy pets_waitlist_insert on public.psa_pets_waitlist
  for insert to anon, authenticated with check (true);
drop policy if exists pets_launchbox_insert on public.psa_pets_launch_box;
create policy pets_launchbox_insert on public.psa_pets_launch_box
  for insert to anon, authenticated with check (true);

-- Live counter without exposing rows
create or replace function public.psa_pets_waitlist_count()
returns bigint
language sql
security definer
set search_path = public
stable
as $$ select count(*) from public.psa_pets_waitlist $$;

revoke all on function public.psa_pets_waitlist_count() from public;
grant execute on function public.psa_pets_waitlist_count() to anon, authenticated;;
