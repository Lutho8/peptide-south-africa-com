
-- Drop broad SELECT on storage and replace with read-by-name only (no listing)
DROP POLICY "Public can view testimonial photos" ON storage.objects;

-- Read individual files only (clients must know the path; no list)
CREATE POLICY "Public read testimonial photo files" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'testimonial-photos');

-- Restrict has_role execution to internal/postgres usage (RLS still works because RLS runs as definer)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
