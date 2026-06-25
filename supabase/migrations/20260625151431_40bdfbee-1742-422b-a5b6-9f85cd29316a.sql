CREATE POLICY "Admins manage reels-obras" ON storage.objects
FOR ALL TO authenticated
USING ((bucket_id = 'reels-obras'::text) AND is_admin())
WITH CHECK ((bucket_id = 'reels-obras'::text) AND is_admin());