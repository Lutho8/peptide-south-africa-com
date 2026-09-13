CREATE TABLE "tracker"."journey_events" (
  "id"         bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "user_id"    uuid                     NOT NULL,
  "event_name" text                     NOT NULL,
  "source"     text                     NOT NULL DEFAULT 'dashboard'::text,
  "context"    jsonb                    NOT NULL DEFAULT '{}'::jsonb,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "journey_events_context_check" CHECK ((jsonb_typeof(context) = 'object'::text)),
  CONSTRAINT "journey_events_event_name_check"
    CHECK
    ((event_name = ANY (ARRAY['dashboard_viewed'::text, 'experience_selected'::text, 'pathway_selected'::text, 'next_action_started'::text, 'next_action_completed'::text,
    'guided_support_requested'::text,
    'research_item_saved'::text,
    'workspace_entry'::text,
    'order_cta_clicked'::text,
    'order_status_viewed'::text,
    'reorder_cta_clicked'::text,
    'support_opened'::text,
    'measurement_tool_opened'::text,
    'dose_history_viewed'::text,
    'local_history_recovered'::text,
    'ai_question_asked'::text,
    'ai_answer_saved'::text,
    'journal_entry_created'::text,
    'confession_submitted'::text,
    'confession_feed_viewed'::text,
    'evidence_passport_viewed'::text, 'research_comparison_viewed'::text, 'research_plan_saved'::text, 'coa_document_uploaded'::text, 'coa_document_deleted'::text]))),
  CONSTRAINT "journey_events_pkey" PRIMARY KEY (id),
  CONSTRAINT "journey_events_source_check" CHECK (((char_length(source) >= 1) AND (char_length(source) <= 60))),
  CONSTRAINT "journey_events_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "tracker"."journey_events"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX journey_events_name_created_idx ON tracker.journey_events USING btree (event_name, created_at DESC);

CREATE INDEX journey_events_user_created_idx ON tracker.journey_events USING btree (user_id, created_at DESC, id DESC);

CREATE POLICY "journey_events_owner_insert" ON "tracker"."journey_events"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "journey_events_select" ON "tracker"."journey_events"
  FOR SELECT
  TO "authenticated"
  USING (((( SELECT auth.uid() AS uid) = user_id) OR tracker.has_role(( SELECT auth.uid() AS uid), 'admin'::tracker.app_role)));

GRANT INSERT, SELECT ON TABLE "tracker"."journey_events" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."journey_events" TO "postgres", "service_role";
