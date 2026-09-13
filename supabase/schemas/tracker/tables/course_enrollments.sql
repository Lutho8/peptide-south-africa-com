CREATE TABLE "tracker"."course_enrollments" (
  "id"                  uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "full_name"           text                     NOT NULL,
  "email"               text                     NOT NULL,
  "sms_consent"         boolean                  NOT NULL DEFAULT false,
  "phone"               text,
  "enrolled_at"         timestamp with time zone NOT NULL DEFAULT now(),
  "course_completed_at" timestamp with time zone,
  "created_at"          timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"          timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "course_enrollments_pkey" PRIMARY KEY (id)
);

ALTER TABLE "tracker"."course_enrollments"
  ENABLE ROW LEVEL SECURITY;

CREATE UNIQUE INDEX idx_course_enrollments_email ON tracker.course_enrollments USING btree (email);

CREATE TRIGGER update_course_enrollments_updated_at
  BEFORE UPDATE ON tracker.course_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION tracker.update_updated_at_column();

CREATE POLICY "admin_all" ON "tracker"."course_enrollments"
  FOR ALL
  TO "authenticated"
  USING (tracker.has_role(( SELECT auth.uid() AS uid), 'admin'::tracker.app_role))
  WITH CHECK (tracker.has_role(( SELECT auth.uid() AS uid), 'admin'::tracker.app_role));

CREATE POLICY "public_insert" ON "tracker"."course_enrollments"
  FOR INSERT
  TO "anon", "authenticated"
  WITH CHECK (true);

GRANT INSERT ON TABLE "tracker"."course_enrollments" TO "anon";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "tracker"."course_enrollments" TO "authenticated";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "tracker"."course_enrollments" TO "postgres", "service_role";
