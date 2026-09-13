CREATE TABLE "public"."checkout_consents" (
  "id"                         bigint                   GENERATED ALWAYS AS IDENTITY NOT NULL,
  "order_id"                   uuid                     NOT NULL,
  "user_id"                    uuid                     NOT NULL,
  "policy_version"             text                     NOT NULL,
  "report_scope_version"       text                     NOT NULL,
  "age_confirmed"              boolean                  NOT NULL,
  "research_use_acknowledged"  boolean                  NOT NULL,
  "non_human_use_acknowledged" boolean                  NOT NULL,
  "report_scope_acknowledged"  boolean                  NOT NULL,
  "marketing_consent"          boolean                  NOT NULL DEFAULT false,
  "accepted_at"                timestamp with time zone NOT NULL DEFAULT now(),
  "client_accepted_at"         timestamp with time zone,
  "statements"                 jsonb                    NOT NULL,
  "source"                     text                     NOT NULL DEFAULT 'storefront_checkout'::text,
  "created_at"                 timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "checkout_consents_age_confirmed_check" CHECK (age_confirmed),
  CONSTRAINT "checkout_consents_non_human_use_acknowledged_check" CHECK (non_human_use_acknowledged),
  CONSTRAINT "checkout_consents_order_id_key" UNIQUE (order_id),
  CONSTRAINT "checkout_consents_pkey" PRIMARY KEY (id),
  CONSTRAINT "checkout_consents_policy_version_check" CHECK (((length(policy_version) >= 1) AND (length(policy_version) <= 80))),
  CONSTRAINT "checkout_consents_report_scope_acknowledged_check" CHECK (report_scope_acknowledged),
  CONSTRAINT "checkout_consents_report_scope_version_check" CHECK (((length(report_scope_version) >= 1) AND (length(report_scope_version) <= 80))),
  CONSTRAINT "checkout_consents_research_use_acknowledged_check" CHECK (research_use_acknowledged),
  CONSTRAINT "checkout_consents_source_check" CHECK (((length(source) >= 1) AND (length(source) <= 80))),
  CONSTRAINT "checkout_consents_statements_check" CHECK (((jsonb_typeof(statements) = 'object'::text) AND (octet_length((statements)::text) <= 8192))),
  CONSTRAINT "checkout_consents_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT "checkout_consents_order_id_fkey" FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE
);

ALTER TABLE "public"."checkout_consents"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX checkout_consents_user_accepted_idx ON public.checkout_consents USING btree (user_id, accepted_at DESC);

CREATE TRIGGER emit_checkout_consent_events
  AFTER INSERT ON public.checkout_consents
  FOR EACH ROW
  EXECUTE FUNCTION private.emit_checkout_consent_event();

CREATE POLICY "checkout_consents_select" ON "public"."checkout_consents"
  FOR SELECT
  TO "authenticated"
  USING (((( SELECT auth.uid() AS uid) = user_id) OR ( SELECT public.has_role(( SELECT auth.uid() AS uid), 'admin'::public.app_role) AS has_role)));

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."checkout_consents" TO "postgres", "service_role";

COMMENT ON TABLE "public"."checkout_consents" IS 'Immutable versioned receipts for research-use checkout acknowledgements and optional marketing consent.';

REVOKE ALL ON TABLE "public"."checkout_consents" FROM "authenticated";

GRANT SELECT ON TABLE "public"."checkout_consents" TO "authenticated";
