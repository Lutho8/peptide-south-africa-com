
CREATE POLICY "Public can read COAs for published batches"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'coa-pdfs'
  AND EXISTS (
    SELECT 1 FROM public.product_batches pb
    WHERE pb.is_published = true
      AND (
        pb.coa_pdf_url = storage.objects.name
        OR pb.coa_pdf_url LIKE '%' || storage.objects.name
      )
  )
);
