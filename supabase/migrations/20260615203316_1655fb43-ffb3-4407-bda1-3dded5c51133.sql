
-- Pin search_path on pgmq wrapper functions
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;

-- Make the public testimonial-photos bucket's public read access explicit via policy
DROP POLICY IF EXISTS "Public read testimonial photos" ON storage.objects;
CREATE POLICY "Public read testimonial photos"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'testimonial-photos');
