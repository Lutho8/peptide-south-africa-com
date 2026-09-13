CREATE TABLE "tracker"."research_saves" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"           uuid                     NOT NULL,
  "peptide_id"        text                     NOT NULL,
  "goal_id"           text                     NOT NULL DEFAULT 'general-research'::text,
  "evidence_version"  text                     NOT NULL,
  "evidence_snapshot" jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"        timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "research_saves_evidence_snapshot_check" CHECK ((jsonb_typeof(evidence_snapshot) = 'object'::text)),
  CONSTRAINT "research_saves_evidence_version_check" CHECK (((char_length(evidence_version) >= 1) AND (char_length(evidence_version) <= 40))),
  CONSTRAINT "research_saves_goal_id_check" CHECK (((char_length(goal_id) >= 1) AND (char_length(goal_id) <= 80))),
  CONSTRAINT "research_saves_peptide_id_check" CHECK (((char_length(peptide_id) >= 1) AND (char_length(peptide_id) <= 100))),
  CONSTRAINT "research_saves_pkey" PRIMARY KEY (id),
  CONSTRAINT "research_saves_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "research_saves_user_id_peptide_id_goal_id_key" UNIQUE (user_id, peptide_id, goal_id)
);

ALTER TABLE "tracker"."research_saves"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX research_saves_user_created_idx ON tracker.research_saves USING btree (user_id, created_at DESC);

CREATE TRIGGER research_saves_set_updated_at
  BEFORE UPDATE ON tracker.research_saves
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "research_saves_owner_delete" ON "tracker"."research_saves"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "research_saves_owner_insert" ON "tracker"."research_saves"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "research_saves_owner_select" ON "tracker"."research_saves"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "research_saves_owner_update" ON "tracker"."research_saves"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."research_saves" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."research_saves" TO "postgres", "service_role";
