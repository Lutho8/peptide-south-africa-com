CREATE TABLE "tracker"."daily_checkins" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"     uuid                     NOT NULL,
  "date"        date                     NOT NULL,
  "observed_at" timestamp with time zone NOT NULL,
  "metrics"     jsonb                    NOT NULL,
  "created_at"  timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "daily_checkins_metrics_check1"
    CHECK (((((metrics ->> 'sleepHours'::text))::numeric >= (0)::numeric) AND (((metrics ->> 'sleepHours'::text))::numeric <= (24)::numeric))),
  CONSTRAINT "daily_checkins_metrics_check2" CHECK (((((metrics ->> 'weightKg'::text))::numeric > (0)::numeric) AND (((metrics ->> 'weightKg'::text))::numeric <= (700)::numeric))),
  CONSTRAINT "daily_checkins_metrics_check3"
    CHECK
    ((((((metrics ->> 'painScore'::text))::numeric >= (0)::numeric) AND (((metrics ->> 'painScore'::text))::numeric <= (10)::numeric)) AND (((metrics ->>
    'painScore'::text))::numeric = trunc(((metrics ->> 'painScore'::text))::numeric)))),
  CONSTRAINT "daily_checkins_metrics_check4"
    CHECK
    ((((((metrics ->> 'energyScore'::text))::numeric >= (0)::numeric) AND (((metrics ->> 'energyScore'::text))::numeric <= (10)::numeric)) AND (((metrics ->>
    'energyScore'::text))::numeric = trunc(((metrics ->> 'energyScore'::text))::numeric)))),
  CONSTRAINT "daily_checkins_metrics_check" CHECK (((jsonb_typeof(metrics) = 'object'::text) AND (octet_length((metrics)::text) <= 16000))),
  CONSTRAINT "daily_checkins_pkey" PRIMARY KEY (id),
  CONSTRAINT "daily_checkins_user_id_date_key" UNIQUE (user_id, date),
  CONSTRAINT "daily_checkins_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "tracker"."daily_checkins"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "daily_checkins_delete_own" ON "tracker"."daily_checkins"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "daily_checkins_insert_own" ON "tracker"."daily_checkins"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "daily_checkins_select_own" ON "tracker"."daily_checkins"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "daily_checkins_update_own" ON "tracker"."daily_checkins"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."daily_checkins" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."daily_checkins" TO "postgres", "service_role";

COMMENT ON TABLE "tracker"."daily_checkins" IS 'One private user-entered observation record per local calendar day; no dose recommendations or inferred effects.';
