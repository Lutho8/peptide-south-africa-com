CREATE TABLE "public"."psa_content" (
  "id"                      integer                     NOT NULL DEFAULT nextval('public.psa_content_id_seq'::regclass),
  "content_id"              character varying(100)      NOT NULL,
  "title"                   character varying(500),
  "content_type"            character varying(50),
  "platform"                character varying(50),
  "persona_tag"             character varying(50),
  "product_sku"             character varying(50),
  "status"                  character varying(50),
  "url"                     character varying(500),
  "file_path"               character varying(500),
  "hook_text"               text,
  "body_text"               text,
  "cta_text"                text,
  "seo_keywords"            jsonb,
  "meta_title"              character varying(100),
  "meta_description"        character varying(300),
  "publish_date"            timestamp without time zone,
  "performance_views"       integer                     DEFAULT 0,
  "performance_engagement"  integer                     DEFAULT 0,
  "performance_ctr"         numeric(5,2),
  "performance_conversions" integer                     DEFAULT 0,
  "performance_cac"         numeric(10,2),
  "created_by_agent"        character varying(100),
  "reviewed_by"             character varying(100),
  "created_at"              timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  "updated_at"              timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "psa_content_content_id_key" UNIQUE (content_id),
  CONSTRAINT "psa_content_pkey" PRIMARY KEY (id)
);

ALTER TABLE "public"."psa_content"
  ENABLE ROW LEVEL SECURITY;

ALTER SEQUENCE "public"."psa_content_id_seq" OWNED BY "public"."psa_content"."id";

CREATE INDEX idx_psa_content_agent ON public.psa_content USING btree (created_by_agent);

CREATE INDEX idx_psa_content_persona ON public.psa_content USING btree (persona_tag);

CREATE INDEX idx_psa_content_platform ON public.psa_content USING btree (platform);

CREATE INDEX idx_psa_content_product ON public.psa_content USING btree (product_sku);

CREATE INDEX idx_psa_content_pub_date ON public.psa_content USING btree (publish_date DESC);

CREATE INDEX idx_psa_content_status ON public.psa_content USING btree (status);

CREATE INDEX idx_psa_content_type ON public.psa_content USING btree (content_type);

CREATE POLICY "Public read content" ON "public"."psa_content"
  FOR SELECT
  TO PUBLIC
  USING (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."psa_content" TO "anon", "authenticated", "postgres", "service_role";
