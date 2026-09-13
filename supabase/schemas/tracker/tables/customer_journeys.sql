CREATE TABLE "tracker"."customer_journeys" (
  "user_id"          uuid                     NOT NULL,
  "experience_mode"  text,
  "pathway"          text                     NOT NULL DEFAULT 'undecided'::text,
  "lifecycle_stage"  text                     NOT NULL DEFAULT 'orientation'::text,
  "primary_goal"     text,
  "onboarding_step"  smallint                 NOT NULL DEFAULT 0,
  "next_action_code" text                     NOT NULL DEFAULT 'choose_experience'::text,
  "last_active_at"   timestamp with time zone NOT NULL DEFAULT now(),
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"       timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "customer_journeys_experience_mode_check" CHECK (((experience_mode IS NULL) OR (experience_mode = ANY (ARRAY['new_to_peptides'::text, 'experienced'::text])))),
  CONSTRAINT "customer_journeys_lifecycle_stage_check"
    CHECK
    ((lifecycle_stage = ANY (ARRAY['orientation'::text, 'pathway_selected'::text, 'guided_intake'::text, 'research_workspace'::text, 'active_customer'::text, 'retention'::text,
    'paused'::text]))),
  CONSTRAINT "customer_journeys_next_action_code_check"
    CHECK
    ((next_action_code = ANY (ARRAY['choose_experience'::text, 'choose_pathway'::text, 'complete_guided_intake'::text, 'review_research_library'::text,
    'record_existing_plan'::text, 'view_order'::text, 'review_workspace'::text, 'contact_support'::text, 'none'::text]))),
  CONSTRAINT "customer_journeys_onboarding_step_check" CHECK (((onboarding_step >= 0) AND (onboarding_step <= 4))),
  CONSTRAINT "customer_journeys_pathway_check" CHECK ((pathway = ANY (ARRAY['undecided'::text, 'guided'::text, 'research'::text]))),
  CONSTRAINT "customer_journeys_pkey" PRIMARY KEY (user_id),
  CONSTRAINT "customer_journeys_primary_goal_check"
    CHECK (((primary_goal IS NULL) OR (primary_goal = ANY (ARRAY['weight_management'::text, 'general_research'::text, 'recovery_research'::text, 'other'::text])))),
  CONSTRAINT "customer_journeys_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "tracker"."customer_journeys"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX customer_journeys_stage_active_idx ON tracker.customer_journeys USING btree (lifecycle_stage, last_active_at DESC);

CREATE TRIGGER customer_journeys_set_updated_at
  BEFORE UPDATE ON tracker.customer_journeys
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "customer_journeys_owner_insert" ON "tracker"."customer_journeys"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "customer_journeys_owner_update" ON "tracker"."customer_journeys"
  FOR UPDATE
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id))
  WITH CHECK ((( SELECT auth.uid() AS uid) = user_id));

CREATE POLICY "customer_journeys_select" ON "tracker"."customer_journeys"
  FOR SELECT
  TO "authenticated"
  USING (((( SELECT auth.uid() AS uid) = user_id) OR tracker.has_role(( SELECT auth.uid() AS uid), 'admin'::tracker.app_role)));

GRANT INSERT, SELECT, UPDATE ON TABLE "tracker"."customer_journeys" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."customer_journeys" TO "postgres", "service_role";
