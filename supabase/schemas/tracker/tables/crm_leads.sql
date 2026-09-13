CREATE TABLE "tracker"."crm_leads" (
  "id"               uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "email"            text                     NOT NULL,
  "first_name"       text,
  "last_name"        text,
  "phone"            text,
  "source"           text                     NOT NULL,
  "plan_interest"    text                     NOT NULL DEFAULT 'undecided'::text,
  "lead_status"      text                     NOT NULL DEFAULT 'new'::text,
  "lead_score"       smallint                 NOT NULL DEFAULT 0,
  "last_activity_at" timestamp with time zone NOT NULL DEFAULT now(),
  "created_at"       timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"       timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "crm_leads_email_normalized" CHECK ((email = lower(TRIM(BOTH FROM email)))),
  CONSTRAINT "crm_leads_email_unique" UNIQUE (email),
  CONSTRAINT "crm_leads_lead_score_check" CHECK (((lead_score >= 0) AND (lead_score <= 100))),
  CONSTRAINT "crm_leads_lead_status_check" CHECK ((lead_status = ANY (ARRAY['new'::text, 'nurturing'::text, 'qualified'::text, 'converted'::text]))),
  CONSTRAINT "crm_leads_pkey" PRIMARY KEY (id),
  CONSTRAINT "crm_leads_plan_interest_check" CHECK ((plan_interest = ANY (ARRAY['free'::text, 'premium'::text, 'undecided'::text])))
);

ALTER TABLE "tracker"."crm_leads"
  ENABLE ROW LEVEL SECURITY;

CREATE INDEX crm_leads_last_activity_idx ON tracker.crm_leads USING btree (last_activity_at DESC);

CREATE INDEX crm_leads_status_score_idx ON tracker.crm_leads USING btree (lead_status, lead_score DESC);

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."crm_leads" TO "postgres", "service_role";
