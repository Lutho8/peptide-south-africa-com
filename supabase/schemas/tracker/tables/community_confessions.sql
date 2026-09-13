CREATE TABLE "tracker"."community_confessions" (
  "id"                uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "author_id"         uuid                     NOT NULL,
  "display_alias"     text                     NOT NULL DEFAULT 'Anonymous researcher'::text,
  "is_anonymous"      boolean                  NOT NULL DEFAULT true,
  "category"          text                     NOT NULL,
  "peptide_ids"       text[]                   NOT NULL DEFAULT '{}'::text[],
  "title"             text                     NOT NULL,
  "body"              text                     NOT NULL,
  "moderation_status" text                     NOT NULL DEFAULT 'pending'::text,
  "moderation_note"   text,
  "published_at"      timestamp with time zone,
  "created_at"        timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"        timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "community_confessions_author_id_fkey" FOREIGN KEY (author_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "community_confessions_body_check" CHECK (((char_length(body) >= 40) AND (char_length(body) <= 3000))),
  CONSTRAINT "community_confessions_category_check"
    CHECK ((category = ANY (ARRAY['what_helped'::text, 'what_surprised_me'::text, 'what_i_wish_i_knew'::text, 'side_effects'::text, 'measurement_lesson'::text]))),
  CONSTRAINT "community_confessions_check" CHECK ((((moderation_status = 'published'::text) AND (published_at IS
    NOT NULL)) OR ((moderation_status <> 'published'::text) AND (published_at IS NULL)))),
  CONSTRAINT "community_confessions_display_alias_check" CHECK (((char_length(display_alias) >= 2) AND (char_length(display_alias) <= 40))),
  CONSTRAINT "community_confessions_moderation_status_check" CHECK ((moderation_status = ANY (ARRAY['pending'::text, 'published'::text, 'rejected'::text]))),
  CONSTRAINT "community_confessions_pkey" PRIMARY KEY (id),
  CONSTRAINT "community_confessions_title_check" CHECK (((char_length(title) >= 5) AND (char_length(title) <= 120)))
);

ALTER TABLE "tracker"."community_confessions"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX community_confessions_author_created_idx ON tracker.community_confessions USING btree (author_id, created_at DESC);

CREATE INDEX community_confessions_public_feed_idx ON tracker.community_confessions USING btree (published_at DESC, created_at DESC)
  WHERE (moderation_status = 'published'::text);

CREATE TRIGGER community_confessions_set_updated_at
  BEFORE UPDATE ON tracker.community_confessions
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "confessions_admin_all" ON "tracker"."community_confessions"
  FOR ALL
  TO "authenticated"
  USING (tracker.has_role(( SELECT auth.uid() AS uid), 'admin'::tracker.app_role))
  WITH CHECK (tracker.has_role(( SELECT auth.uid() AS uid), 'admin'::tracker.app_role));

CREATE POLICY "confessions_owner_delete" ON "tracker"."community_confessions"
  FOR DELETE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = author_id));

CREATE POLICY "confessions_owner_edit_pending" ON "tracker"."community_confessions"
  FOR UPDATE
  TO "authenticated"
  USING (((( SELECT auth.uid() AS uid) = author_id) AND (moderation_status = 'pending'::text)))
  WITH CHECK (((( SELECT auth.uid() AS uid) = author_id) AND (moderation_status = 'pending'::text) AND (published_at IS NULL) AND (moderation_note IS NULL)));

CREATE POLICY "confessions_owner_read" ON "tracker"."community_confessions"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = author_id));

CREATE POLICY "confessions_owner_submit" ON "tracker"."community_confessions"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((( SELECT auth.uid() AS uid) = author_id) AND (moderation_status = 'pending'::text) AND (published_at IS NULL) AND (moderation_note IS NULL)));

CREATE POLICY "confessions_public_read" ON "tracker"."community_confessions"
  FOR SELECT
  TO "anon", "authenticated"
  USING (((moderation_status = 'published'::text) AND (published_at <= now())));

GRANT SELECT ON TABLE "tracker"."community_confessions" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."community_confessions" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."community_confessions" TO "postgres", "service_role";
