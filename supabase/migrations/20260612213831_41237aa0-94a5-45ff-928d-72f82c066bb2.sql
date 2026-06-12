
CREATE TABLE public.community_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone_e164 text NOT NULL UNIQUE,
  phone_country text,
  interest text NOT NULL,
  source text NOT NULL DEFAULT 'community-page',
  consent_marketing boolean NOT NULL DEFAULT false,
  ip_hash text,
  bsp_status text NOT NULL DEFAULT 'pending',
  bsp_last_error text,
  joined_group_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.community_members TO service_role;
GRANT SELECT ON public.community_members TO authenticated;

ALTER TABLE public.community_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read community members"
  ON public.community_members FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_community_members_updated_at
  BEFORE UPDATE ON public.community_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.community_join_rate (
  ip_hash text PRIMARY KEY,
  window_start timestamptz NOT NULL DEFAULT now(),
  count integer NOT NULL DEFAULT 0
);

GRANT ALL ON public.community_join_rate TO service_role;
ALTER TABLE public.community_join_rate ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.bump_community_rate(_ip_hash text, _limit integer DEFAULT 5, _window_minutes integer DEFAULT 60)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cur_count integer;
  cur_start timestamptz;
BEGIN
  IF _ip_hash IS NULL OR length(_ip_hash) = 0 THEN
    RETURN true;
  END IF;

  INSERT INTO public.community_join_rate (ip_hash, window_start, count)
    VALUES (_ip_hash, now(), 1)
  ON CONFLICT (ip_hash) DO UPDATE
    SET count = CASE
      WHEN public.community_join_rate.window_start < now() - make_interval(mins => _window_minutes) THEN 1
      ELSE public.community_join_rate.count + 1
    END,
    window_start = CASE
      WHEN public.community_join_rate.window_start < now() - make_interval(mins => _window_minutes) THEN now()
      ELSE public.community_join_rate.window_start
    END
  RETURNING count INTO cur_count;

  RETURN cur_count <= _limit;
END;
$$;
