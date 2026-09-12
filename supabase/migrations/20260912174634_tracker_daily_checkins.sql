create table tracker.daily_checkins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  observed_at timestamptz not null,
  metrics jsonb not null check (jsonb_typeof(metrics) = 'object' and octet_length(metrics::text) <= 16000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, date),
  check ((metrics->>'sleepHours')::numeric between 0 and 24),
  check ((metrics->>'weightKg')::numeric > 0 and (metrics->>'weightKg')::numeric <= 700),
  check ((metrics->>'painScore')::numeric between 0 and 10 and (metrics->>'painScore')::numeric = trunc((metrics->>'painScore')::numeric)),
  check ((metrics->>'energyScore')::numeric between 0 and 10 and (metrics->>'energyScore')::numeric = trunc((metrics->>'energyScore')::numeric))
);
alter table tracker.daily_checkins enable row level security;
revoke all on tracker.daily_checkins from anon;
grant select, insert, update, delete on tracker.daily_checkins to authenticated;
create policy daily_checkins_select_own on tracker.daily_checkins for select to authenticated using ((select auth.uid()) = user_id);
create policy daily_checkins_insert_own on tracker.daily_checkins for insert to authenticated with check ((select auth.uid()) = user_id);
create policy daily_checkins_update_own on tracker.daily_checkins for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy daily_checkins_delete_own on tracker.daily_checkins for delete to authenticated using ((select auth.uid()) = user_id);
comment on table tracker.daily_checkins is 'One private user-entered observation record per local calendar day; no dose recommendations or inferred effects.';
;
