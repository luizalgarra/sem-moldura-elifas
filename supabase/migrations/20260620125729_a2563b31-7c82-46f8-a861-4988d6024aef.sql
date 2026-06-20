-- 1. Storage RLS: restrict private buckets to admins
CREATE POLICY "Admins manage audios-obras"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'audios-obras' AND public.is_admin())
WITH CHECK (bucket_id = 'audios-obras' AND public.is_admin());

CREATE POLICY "Admins manage imagens-obras"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'imagens-obras' AND public.is_admin())
WITH CHECK (bucket_id = 'imagens-obras' AND public.is_admin());

-- 2. Harden SECURITY DEFINER ordering functions: remove anon/public execute
REVOKE EXECUTE ON FUNCTION public.inserir_na_ordem(integer, integer) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.remover_da_ordem(integer) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.inserir_na_ordem(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remover_da_ordem(integer) TO authenticated;