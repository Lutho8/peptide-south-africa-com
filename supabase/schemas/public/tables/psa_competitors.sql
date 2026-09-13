CREATE TABLE "public"."psa_competitors" (
  "id"                integer                     NOT NULL DEFAULT nextval('public.psa_competitors_id_seq'::regclass),
  "name"              character varying(100)      NOT NULL,
  "website"           character varying(500),
  "price_page_url"    character varying(500),
  "positioning"       character varying(255),
  "key_products"      jsonb,
  "price_range"       character varying(50),
  "our_edge"          text,
  "threat_level"      character varying(20),
  "last_price_scrape" timestamp without time zone,
  "price_data"        jsonb,
  "price_vs_psa"      jsonb,
  "last_alert"        text,
  "marketing_tactics" jsonb,
  "social_followers"  jsonb,
  "seo_metrics"       jsonb,
  "created_at"        timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at"        timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "psa_competitors_name_key" UNIQUE (name),
  CONSTRAINT "psa_competitors_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."psa_competitors"
  ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."psa_competitors_id_seq" OWNED BY "public"."psa_competitors"."id";

CREATE INDEX idx_psa_comp_name ON public.psa_competitors USING btree (name);

CREATE INDEX idx_psa_comp_threat ON public.psa_competitors USING btree (threat_level);

CREATE POLICY "Public read competitors" ON "public"."psa_competitors"
  FOR SELECT
  TO PUBLIC
  USING (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_competitors" TO "anon", "authenticated", "postgres", "service_role";
