CREATE TABLE "tracker"."pk_user_overrides" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"         uuid                     NOT NULL,
  "peptide_id"      text                     NOT NULL,
  "half_life_hours" numeric,
  "bioavailability" numeric,
  "absorption_rate" numeric,
  "route"           text,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"      timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "pk_user_overrides_pkey" PRIMARY KEY (id),
  CONSTRAINT "pk_user_overrides_user_id_peptide_id_key" UNIQUE (user_id, peptide_id)
);

ALTER TABLE "tracker"."pk_user_overrides"
  ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_pk_overrides_updated
  BEFORE UPDATE ON tracker.pk_user_overrides
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "owner_delete" ON "tracker"."pk_user_overrides"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_insert" ON "tracker"."pk_user_overrides"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_select" ON "tracker"."pk_user_overrides"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_update" ON "tracker"."pk_user_overrides"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."pk_user_overrides" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."pk_user_overrides" TO "postgres", "service_role";
