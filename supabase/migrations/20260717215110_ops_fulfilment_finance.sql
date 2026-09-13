create table b2b_accounts (
  id uuid primary key default gen_random_uuid(),
  company text not null, contact_name text, email text, phone text,
  account_type text not null default 'clinic' check (account_type in ('clinic','gym','reseller','practitioner','other')),
  terms text not null default 'prepaid' check (terms in ('prepaid','net7','net14','net30')),
  discount_pct numeric(4,1) not null default 0,
  status text not null default 'prospect' check (status in ('prospect','active','paused','closed')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table shipments (
  id uuid primary key default gen_random_uuid(),
  order_ref text not null,
  customer_id integer references psa_customers(id) on delete set null,
  b2b_account_id uuid references b2b_accounts(id) on delete set null,
  channel text not null default 'b2c' check (channel in ('b2c','b2b','d2c')),
  courier text, tracking_number text,
  status text not null default 'pending_pick' check (status in ('pending_pick','packed','dispatched','in_transit','out_for_delivery','delivered','exception','returned')),
  cold_chain boolean not null default true,
  ship_date date, promised_date date, delivered_at timestamptz,
  courier_cost numeric(10,2), packaging_cost numeric(10,2), weight_kg numeric(6,2),
  address_city text, address_province text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table fulfilment_events (
  id uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references shipments(id) on delete cascade,
  event text not null, note text,
  logged_by text not null default 'agent',
  created_at timestamptz not null default now()
);

create table refunds_chargebacks (
  id uuid primary key default gen_random_uuid(),
  order_ref text not null,
  customer_id integer references psa_customers(id) on delete set null,
  type text not null check (type in ('refund','chargeback')),
  reason text, amount numeric(10,2) not null,
  processor text check (processor in ('payfast','yoco','ozow','eft','other')),
  status text not null default 'requested' check (status in ('requested','evidence_due','evidence_submitted','won','lost','refunded','closed')),
  evidence_due_date date,
  cpa_basis text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  category text not null check (category in ('cogs','courier','packaging','payment_fees','ads','software','tax_vat','tax_income','rent','other')),
  amount numeric(10,2) not null,
  vendor text, order_ref text, note text,
  created_at timestamptz not null default now()
);

create index idx_shipments_status on shipments(status) where status not in ('delivered','returned');
create index idx_shipments_order on shipments(order_ref);
create index idx_fulf_events_ship on fulfilment_events(shipment_id, created_at desc);
create index idx_rc_status on refunds_chargebacks(status) where status not in ('won','refunded','closed');
create index idx_expenses_date on expenses(date);
create index idx_expenses_cat on expenses(category, date);

create or replace function set_updated_at_ops() returns trigger
language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
create trigger t_b2b_upd before update on b2b_accounts for each row execute function set_updated_at_ops();
create trigger t_shipments_upd before update on shipments for each row execute function set_updated_at_ops();
create trigger t_rc_upd before update on refunds_chargebacks for each row execute function set_updated_at_ops();

alter table b2b_accounts enable row level security;
alter table shipments enable row level security;
alter table fulfilment_events enable row level security;
alter table refunds_chargebacks enable row level security;
alter table expenses enable row level security;

create policy "auth_full_b2b" on b2b_accounts for all to authenticated using (true) with check (true);
create policy "auth_full_shipments" on shipments for all to authenticated using (true) with check (true);
create policy "auth_full_fulf_events" on fulfilment_events for all to authenticated using (true) with check (true);
create policy "auth_full_rc" on refunds_chargebacks for all to authenticated using (true) with check (true);
create policy "auth_full_expenses" on expenses for all to authenticated using (true) with check (true);;
