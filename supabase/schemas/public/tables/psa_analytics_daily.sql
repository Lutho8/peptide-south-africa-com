CREATE TABLE "public"."psa_analytics_daily" (
  "id"                   integer                     NOT NULL DEFAULT nextval('public.psa_analytics_daily_id_seq'::regclass),
  "date"                 date                        NOT NULL,
  "hour"                 integer,
  "tracker_signups"      integer                     DEFAULT 0,
  "tracker_active_users" integer                     DEFAULT 0,
  "protocol_completions" integer                     DEFAULT 0,
  "avg_adherence"        numeric(5,2)                DEFAULT 0.00,
  "quiz_completion_rate" numeric(5,2)                DEFAULT 0.00,
  "top_persona"          character varying(50),
  "device_breakdown"     jsonb,
  "source_breakdown"     jsonb,
  "content_gap"          text,
  "ecommerce_orders"     integer                     DEFAULT 0,
  "ecommerce_revenue"    numeric(10,2)               DEFAULT 0.00,
  "ecommerce_aov"        numeric(10,2)               DEFAULT 0.00,
  "ad_spend"             numeric(10,2)               DEFAULT 0.00,
  "cac"                  numeric(10,2)               DEFAULT 0.00,
  "new_customers"        integer                     DEFAULT 0,
  "churned_customers"    integer                     DEFAULT 0,
  "created_at"           timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "psa_analytics_daily_date_hour_unique" UNIQUE (date, hour),
  CONSTRAINT "psa_analytics_daily_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."psa_analytics_daily"
  ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."psa_analytics_daily_id_seq" OWNED BY "public"."psa_analytics_daily"."id";

CREATE INDEX idx_psa_analytics_date_hour ON public.psa_analytics_daily USING btree (date, hour);

CREATE INDEX idx_psa_analytics_date ON public.psa_analytics_daily USING btree (date DESC);

CREATE POLICY "sr_psa_analytics_daily" ON "public"."psa_analytics_daily"
  FOR ALL
  TO "service_role"
  USING (true)
  WITH CHECK (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_analytics_daily" TO "anon", "authenticated";

GRANT SELECT ON TABLE "public"."psa_analytics_daily" TO "crm_reader";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_analytics_daily" TO "postgres", "service_role";
