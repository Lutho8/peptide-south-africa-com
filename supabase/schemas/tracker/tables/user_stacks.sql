CREATE TABLE "tracker"."user_stacks" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                     NOT NULL,
  "peptide_id" text                     NOT NULL,
  "dose"       text                     NOT NULL,
  "frequency"  text                     NOT NULL,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "user_stacks_pkey" PRIMARY KEY (id),
  CONSTRAINT "user_stacks_user_peptide_unique" UNIQUE (user_id, peptide_id)
);

ALTER TABLE "tracker"."user_stacks"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_user_stacks_user_id ON tracker.user_stacks USING btree (user_id);

CREATE TRIGGER update_user_stacks_updated_at
  BEFORE UPDATE ON tracker.user_stacks
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "owner_delete" ON "tracker"."user_stacks"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_insert" ON "tracker"."user_stacks"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_select" ON "tracker"."user_stacks"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "owner_update" ON "tracker"."user_stacks"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."user_stacks" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."user_stacks" TO "postgres", "service_role";
