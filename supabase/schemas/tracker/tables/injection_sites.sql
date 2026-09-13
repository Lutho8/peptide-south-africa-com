CREATE TABLE "tracker"."injection_sites" (
  "id"                 text     NOT NULL,
  "region"             text     NOT NULL,
  "side"               text     NOT NULL,
  "zone_index"         smallint NOT NULL,
  "svg_path_id"        text     NOT NULL,
  "recommended_routes" text[]   NOT NULL DEFAULT ARRAY['subcutaneous'::text],
  "display_name"       text     NOT NULL,
  CONSTRAINT "injection_sites_pkey" PRIMARY KEY (id),
  CONSTRAINT "injection_sites_side_check" CHECK ((side = ANY (ARRAY['L'::text, 'R'::text, 'C'::text])))
);

ALTER TABLE "tracker"."injection_sites"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reference_read" ON "tracker"."injection_sites"
  FOR SELECT
  TO "anon", "authenticated"
  USING (true);

GRANT SELECT ON TABLE "tracker"."injection_sites" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."injection_sites" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."injection_sites" TO "postgres", "service_role";
