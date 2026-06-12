
REVOKE EXECUTE ON FUNCTION public.bump_community_rate(text, integer, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bump_community_rate(text, integer, integer) TO service_role;
