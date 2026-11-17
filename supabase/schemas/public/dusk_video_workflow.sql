-- Additive campaign namespace. No existing campaign, checkout or customer tables changed.
CREATE TABLE public.dusk_video_creatives (
  campaign_id text NOT NULL CHECK (campaign_id = 'dusk-pinealon-01'),
  variant_id text NOT NULL CHECK (variant_id IN ('h1','h2','h3')),
  script_version text NOT NULL CHECK (script_version = 'pinealon-research-v1'),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','script_reviewed','rendered','approved')),
  revision integer NOT NULL DEFAULT 0 CHECK (revision >= 0),
  render jsonb,
  updated_by uuid REFERENCES auth.users(id),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (campaign_id,variant_id),
  CHECK ((status IN ('draft','script_reviewed') AND render IS NULL) OR (status IN ('rendered','approved') AND jsonb_typeof(render)='object' AND render IS NOT NULL))
);
CREATE TABLE public.dusk_video_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id text NOT NULL,
  variant_id text NOT NULL,
  before_record jsonb NOT NULL,
  after_record jsonb NOT NULL,
  actor_id uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.dusk_video_events (
  event_id uuid PRIMARY KEY,
  campaign_id text NOT NULL CHECK (campaign_id='dusk-pinealon-01'),
  variant_id text NOT NULL CHECK (variant_id IN ('h1','h2','h3')),
  event text NOT NULL CHECK (event IN ('research_landing','research_source_click')),
  attribution jsonb NOT NULL,
  provenance text NOT NULL DEFAULT 'client_reported' CHECK (provenance='client_reported'),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX dusk_video_events_counts ON public.dusk_video_events(campaign_id,variant_id,event);
ALTER TABLE public.dusk_video_creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dusk_video_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dusk_video_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.dusk_video_creatives FROM PUBLIC,anon,authenticated;
REVOKE ALL ON public.dusk_video_audit FROM PUBLIC,anon,authenticated;
REVOKE ALL ON public.dusk_video_events FROM PUBLIC,anon,authenticated;
GRANT SELECT, INSERT, UPDATE ON public.dusk_video_creatives TO service_role;
GRANT SELECT, INSERT ON public.dusk_video_audit TO service_role;
GRANT SELECT, INSERT, DELETE ON public.dusk_video_events TO service_role;
CREATE POLICY dusk_creatives_service ON public.dusk_video_creatives FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY dusk_audit_service ON public.dusk_video_audit FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY dusk_events_service ON public.dusk_video_events FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE SCHEMA IF NOT EXISTS dusk_internal;
REVOKE ALL ON SCHEMA dusk_internal FROM PUBLIC,anon,authenticated;
GRANT USAGE ON SCHEMA dusk_internal TO service_role;
CREATE FUNCTION dusk_internal.audit_creative() RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path='' AS $$
BEGIN
  INSERT INTO public.dusk_video_audit(campaign_id,variant_id,before_record,after_record,actor_id)
  VALUES(NEW.campaign_id,NEW.variant_id,to_jsonb(OLD),to_jsonb(NEW),NEW.updated_by);
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION dusk_internal.audit_creative() FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION dusk_internal.audit_creative() TO service_role;
CREATE TRIGGER dusk_creative_audit AFTER UPDATE ON public.dusk_video_creatives FOR EACH ROW EXECUTE FUNCTION dusk_internal.audit_creative();
