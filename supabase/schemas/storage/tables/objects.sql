CREATE POLICY "Admins can delete COA PDFs" ON "storage"."objects"
  FOR DELETE
  TO "authenticated"
  USING (((bucket_id = 'coa-pdfs'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role)));

CREATE POLICY "Admins can read COA PDFs" ON "storage"."objects"
  FOR SELECT
  TO "authenticated"
  USING (((bucket_id = 'coa-pdfs'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role)));

CREATE POLICY "Admins can update COA PDFs" ON "storage"."objects"
  FOR UPDATE
  TO "authenticated"
  USING (((bucket_id = 'coa-pdfs'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role)));

CREATE POLICY "Admins can upload COA PDFs" ON "storage"."objects"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((bucket_id = 'coa-pdfs'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role)));

CREATE POLICY "Admins delete testimonial photos" ON "storage"."objects"
  FOR DELETE
  TO "authenticated"
  USING (((bucket_id = 'testimonial-photos'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role)));

CREATE POLICY "Admins update testimonial photos" ON "storage"."objects"
  FOR UPDATE
  TO "authenticated"
  USING (((bucket_id = 'testimonial-photos'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role)));

CREATE POLICY "Admins upload testimonial photos" ON "storage"."objects"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((bucket_id = 'testimonial-photos'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role)));

CREATE POLICY "Public can read COAs for published batches" ON "storage"."objects"
  FOR SELECT
  TO "anon", "authenticated"
  USING (((bucket_id = 'coa-pdfs'::text) AND (EXISTS ( SELECT 1
   FROM public.product_batches pb
  WHERE ((pb.is_published = true) AND ((pb.coa_pdf_url = objects.name) OR (pb.coa_pdf_url ~~ ('%'::text || objects.name))))))));

CREATE POLICY "Users can delete own lab reports storage" ON "storage"."objects"
  FOR DELETE
  TO "authenticated"
  USING (((bucket_id = 'lab-reports'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));

CREATE POLICY "Users can delete own progress photos" ON "storage"."objects"
  FOR DELETE
  TO "authenticated"
  USING (((bucket_id = 'progress-photos'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));

CREATE POLICY "Users can update own lab reports" ON "storage"."objects"
  FOR UPDATE
  TO "authenticated"
  USING (((bucket_id = 'lab-reports'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)))
  WITH CHECK (((bucket_id = 'lab-reports'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));

CREATE POLICY "Users can update own progress photos" ON "storage"."objects"
  FOR UPDATE
  TO "authenticated"
  USING (((bucket_id = 'progress-photos'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)))
  WITH CHECK (((bucket_id = 'progress-photos'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));

CREATE POLICY "Users can upload own lab reports" ON "storage"."objects"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((bucket_id = 'lab-reports'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));

CREATE POLICY "Users can upload own progress photos" ON "storage"."objects"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((bucket_id = 'progress-photos'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));

CREATE POLICY "Users can view own lab reports storage" ON "storage"."objects"
  FOR SELECT
  TO "authenticated"
  USING (((bucket_id = 'lab-reports'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));

CREATE POLICY "Users can view own progress photos" ON "storage"."objects"
  FOR SELECT
  TO "authenticated"
  USING (((bucket_id = 'progress-photos'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));

CREATE POLICY "coa_vault_owner_delete" ON "storage"."objects"
  FOR DELETE
  TO "authenticated"
  USING (((bucket_id = 'coa-vault'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));

CREATE POLICY "coa_vault_owner_insert" ON "storage"."objects"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (((bucket_id = 'coa-vault'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));

CREATE POLICY "coa_vault_owner_select" ON "storage"."objects"
  FOR SELECT
  TO "authenticated"
  USING (((bucket_id = 'coa-vault'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));

CREATE POLICY "coa_vault_owner_update" ON "storage"."objects"
  FOR UPDATE
  TO "authenticated"
  USING (((bucket_id = 'coa-vault'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)))
  WITH CHECK (((bucket_id = 'coa-vault'::text) AND ((storage.foldername(name))[1] = (( SELECT auth.uid() AS uid))::text)));
