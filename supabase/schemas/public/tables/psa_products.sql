CREATE TABLE "public"."psa_products" (
  "id"                       integer                     NOT NULL DEFAULT nextval('public.psa_products_id_seq'::regclass),
  "sku"                      character varying(50)       NOT NULL,
  "name"                     character varying(255)      NOT NULL,
  "category"                 character varying(100),
  "subcategory"              character varying(100),
  "description"              text,
  "factory_price_usd"        numeric(10,2),
  "cogs_zar"                 numeric(10,2),
  "retail_price_zar"         numeric(10,2),
  "retail_price_3pack_zar"   numeric(10,2),
  "gross_margin_percent"     numeric(5,2),
  "net_margin_percent"       numeric(5,2),
  "markup"                   numeric(5,2),
  "hplc_purity"              character varying(20),
  "coa_url"                  character varying(500),
  "batch_number"             character varying(100),
  "expiry_date"              date,
  "stock_quantity"           integer                     DEFAULT 0,
  "stock_status"             character varying(50),
  "is_bundle"                boolean                     DEFAULT false,
  "bundle_components"        jsonb,
  "is_subscription_eligible" boolean                     DEFAULT true,
  "persona_tags"             jsonb,
  "marketing_priority"       integer                     DEFAULT 0,
  "research_papers"          jsonb,
  "competitor_prices"        jsonb,
  "created_at"               timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at"               timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "psa_products_pkey" PRIMARY KEY (id),
  CONSTRAINT "psa_products_sku_key" UNIQUE (sku)
);

ALTER TABLE "public"."psa_products"
  ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."psa_products_id_seq" OWNED BY "public"."psa_products"."id";

CREATE INDEX idx_psa_prod_bundle ON public.psa_products USING btree (is_bundle);

CREATE INDEX idx_psa_prod_category ON public.psa_products USING btree (category);

CREATE INDEX idx_psa_prod_persona ON public.psa_products USING gin (persona_tags);

CREATE INDEX idx_psa_prod_sku ON public.psa_products USING btree (sku);

CREATE INDEX idx_psa_prod_stock ON public.psa_products USING btree (stock_status);

CREATE POLICY "Public read products" ON "public"."psa_products"
  FOR SELECT
  TO PUBLIC
  USING (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_products" TO "anon", "authenticated";

GRANT SELECT ON TABLE "public"."psa_products" TO "crm_reader";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_products" TO "postgres", "service_role";
