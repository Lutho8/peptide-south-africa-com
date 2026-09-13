CREATE TABLE "tracker"."research_journal_entries" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                     NOT NULL,
  "entry_type" text                     NOT NULL DEFAULT 'note'::text,
  "peptide_id" text,
  "title"      text                     NOT NULL,
  "body"       text                     NOT NULL,
  "entry_date" date                     NOT NULL DEFAULT CURRENT_DATE,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "research_journal_entries_body_check" CHECK (((char_length(body) >= 1) AND (char_length(body) <= 6000))),
  CONSTRAINT "research_journal_entries_entry_type_check" CHECK ((entry_type = ANY (ARRAY['note'::text, 'ask'::text, 'measurement'::text, 'milestone'::text]))),
  CONSTRAINT "research_journal_entries_pkey" PRIMARY KEY (id),
  CONSTRAINT "research_journal_entries_title_check" CHECK (((char_length(title) >= 1) AND (char_length(title) <= 120))),
  CONSTRAINT "research_journal_entries_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "tracker"."research_journal_entries"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX research_journal_entries_user_date_idx ON tracker.research_journal_entries USING btree (user_id, entry_date DESC, created_at DESC);

CREATE TRIGGER research_journal_entries_set_updated_at
  BEFORE UPDATE ON tracker.research_journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "research_journal_owner_delete" ON "tracker"."research_journal_entries"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "research_journal_owner_insert" ON "tracker"."research_journal_entries"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "research_journal_owner_select" ON "tracker"."research_journal_entries"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "research_journal_owner_update" ON "tracker"."research_journal_entries"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."research_journal_entries" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."research_journal_entries" TO "postgres", "service_role";
