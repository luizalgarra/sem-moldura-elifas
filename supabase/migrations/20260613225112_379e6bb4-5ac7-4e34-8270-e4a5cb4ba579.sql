CREATE POLICY "Admins can read admin emails"
ON public.admin_emails
FOR SELECT
TO authenticated
USING (public.is_admin());

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
