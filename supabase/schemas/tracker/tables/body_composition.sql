CREATE TABLE "tracker"."body_composition" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"          uuid                     NOT NULL,
  "date"             date                     NOT NULL,
  "weight"           numeric(5,2)             NOT NULL,
  "bmi"              numeric(4,1),
  "body_fat"         numeric(4,1),
  "fat_free_weight"  numeric(5,2),
  "muscle_mass"      numeric(5,2),
  "skeletal_muscle"  numeric(4,1),
  "body_water"       numeric(4,1),
  "subcutaneous_fat" numeric(4,1),
  "visceral_fat"     integer,
  "bone_mass"        numeric(4,2),
  "protein"          numeric(4,1),
  "bmr"              integer,
  "metabolic_age"    integer,
  "source"           text                     DEFAULT 'manual'::text,
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "body_composition_pkey" PRIMARY KEY (id),
  CONSTRAINT "body_composition_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "tracker"."body_composition"
  ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX body_composition_user_date_unique ON tracker.body_composition USING btree (user_id, date);

CREATE POLICY "owner_delete" ON "tracker"."body_composition"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_insert" ON "tracker"."body_composition"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_select" ON "tracker"."body_composition"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_update" ON "tracker"."body_composition"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."body_composition" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."body_composition" TO "postgres", "service_role";
