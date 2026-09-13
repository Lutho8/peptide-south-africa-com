create table if not exists public.bank_deposits (
  id uuid primary key default gen_random_uuid(),
  received_at timestamptz not null default now(),
  amount numeric(10,2) not null,
  reference text,
  payer_name text,
  raw jsonb,
  source text not null default 'capitec_email',
  dedupe_key text unique,
  matched_order_id text,
  status text not null default 'unmatched' check (status in ('unmatched','matched','ignored','duplicate')),
  created_at timestamptz not null default now()
);

create index if not exists bank_deposits_reference_idx on public.bank_deposits (reference);
create index if not exists bank_deposits_status_idx on public.bank_deposits (status);

alter table public.bank_deposits enable row level security;

drop policy if exists bank_deposits_service_role_all on public.bank_deposits;
create policy bank_deposits_service_role_all on public.bank_deposits
  for all to service_role
  using (true)
  with check (true);;
