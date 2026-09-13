CREATE TABLE "tracker"."progress_photos" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                     NOT NULL,
  "date"       date                     NOT NULL,
  "photo_url"  text                     NOT NULL,
  "category"   text                     NOT NULL DEFAULT 'front'::text,
  "weight"     numeric(5,1),
  "notes"      text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "progress_photos_pkey" PRIMARY KEY (id)
);

ALTER TABLE "tracker"."progress_photos"
  ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner_delete" ON "tracker"."progress_photos"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_insert" ON "tracker"."progress_photos"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_select" ON "tracker"."progress_photos"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_update" ON "tracker"."progress_photos"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."progress_photos" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."progress_photos" TO "postgres", "service_role";
