CREATE TABLE "public"."reorder_reminders" (
  "id"              uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"         uuid                     NOT NULL,
  "product_slug"    text                     NOT NULL,
  "variant_label"   text,
  "due_at"          timestamp with time zone NOT NULL,
  "sent_at"         timestamp with time zone,
  "source_order_id" uuid,
  "created_at"      timestamp with time zone NOT NULL DEFAULT now(),
  "channel"         text                     NOT NULL DEFAULT 'email'::text,
  "template"        text                     NOT NULL DEFAULT 'reorder_d0'::text,
  "attempt_count"   integer                  NOT NULL DEFAULT 0,
  CONSTRAINT "reorder_reminders_pkey" PRIMARY KEY (id),
  CONSTRAINT "reorder_reminders_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

ALTER TABLE "public"."reorder_reminders"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_reminders_due ON public.reorder_reminders USING btree (due_at)
  WHERE (sent_at IS NULL);

CREATE INDEX idx_reorder_reminders_due ON public.reorder_reminders USING btree (due_at, sent_at)
  WHERE (sent_at IS NULL);

CREATE POLICY "reorder_reminders_owner_or_admin_select" ON "public"."reorder_reminders"
  FOR SELECT
  TO "authenticated"
  USING (((user_id = ( SELECT auth.uid() AS uid)) OR public.has_role(( SELECT auth.uid() AS uid), 'admin'::public.app_role)));

GRANT SELECT ON TABLE "public"."reorder_reminders" TO "crm_reader";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."reorder_reminders" TO "postgres", "service_role";

REVOKE ALL ("due_at") ON TABLE "public"."reorder_reminders" FROM "authenticated";

GRANT SELECT ("due_at") ON TABLE "public"."reorder_reminders" TO "authenticated";

REVOKE ALL ("id") ON TABLE "public"."reorder_reminders" FROM "authenticated";

GRANT SELECT ("id") ON TABLE "public"."reorder_reminders" TO "authenticated";

REVOKE ALL ("product_slug") ON TABLE "public"."reorder_reminders" FROM "authenticated";

GRANT SELECT ("product_slug") ON TABLE "public"."reorder_reminders" TO "authenticated";

REVOKE ALL ("source_order_id") ON TABLE "public"."reorder_reminders" FROM "authenticated";

GRANT SELECT ("source_order_id") ON TABLE "public"."reorder_reminders" TO "authenticated";

REVOKE ALL ("user_id") ON TABLE "public"."reorder_reminders" FROM "authenticated";

GRANT SELECT ("user_id") ON TABLE "public"."reorder_reminders" TO "authenticated";

REVOKE ALL ("variant_label") ON TABLE "public"."reorder_reminders" FROM "authenticated";

GRANT SELECT ("variant_label") ON TABLE "public"."reorder_reminders" TO "authenticated";
