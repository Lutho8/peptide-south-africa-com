CREATE TABLE "tracker"."subscriptions" (
  "id"                       uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"                  uuid                     NOT NULL,
  "provider"                 text                     NOT NULL DEFAULT 'tagadapay'::text,
  "provider_subscription_id" text,
  "provider_customer_id"     text,
  "current_period_end"       timestamp with time zone,
  "cancel_at_period_end"     boolean                  NOT NULL DEFAULT false,
  "created_at"               timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"               timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "subscriptions_pkey" PRIMARY KEY (id),
  CONSTRAINT "subscriptions_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "subscriptions_user_id_key" UNIQUE (user_id)
);

ALTER TABLE "tracker"."subscriptions"
  ENABLE ROW LEVEL SECURITY;

ALTER TABLE "tracker"."subscriptions"
  ADD COLUMN "plan" tracker.subscription_plan;

ALTER TABLE "tracker"."subscriptions"
  ADD COLUMN "status" tracker.subscription_status NOT NULL DEFAULT 'pending'::tracker.subscription_status;

CREATE INDEX idx_subscriptions_status ON tracker.subscriptions USING btree (status);

CREATE INDEX idx_subscriptions_user_id ON tracker.subscriptions USING btree (user_id);

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON tracker.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "admin_all" ON "tracker"."subscriptions"
  FOR ALL
  TO "authenticated"
  USING (tracker.has_role(( SELECT auth.uid() AS uid), 'admin'::tracker.app_role))
  WITH CHECK (tracker.has_role(( SELECT auth.uid() AS uid), 'admin'::tracker.app_role));

CREATE POLICY "owner_select" ON "tracker"."subscriptions"
  FOR SELECT
  TO "authenticated"
  USING ((( SELECT auth.uid() AS uid) = user_id));

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."subscriptions" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."subscriptions" TO "postgres", "service_role";
