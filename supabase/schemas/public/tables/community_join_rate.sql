CREATE TABLE "public"."community_join_rate" (
  "ip_hash"      text                     NOT NULL,
  "window_start" timestamp with time zone NOT NULL DEFAULT now(),
  "count"        integer                  NOT NULL DEFAULT 0,
  CONSTRAINT "community_join_rate_pkey" PRIMARY KEY (ip_hash)
);

ALTER TABLE "public"."community_join_rate"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sr_community_join_rate" ON "public"."community_join_rate"
  FOR ALL
  TO "service_role"
  USING (true)
  WITH CHECK (true);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."community_join_rate" TO "anon", "authenticated", "postgres", "service_role";
