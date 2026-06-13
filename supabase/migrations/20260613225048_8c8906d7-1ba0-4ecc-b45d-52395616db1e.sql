CREATE TABLE public.admin_emails (
  email text PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.admin_emails TO authenticated;
GRANT ALL ON public.admin_emails TO service_role;

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.admin_emails ae
    WHERE lower(ae.email) = lower((SELECT u.email FROM auth.users u WHERE u.id = auth.uid()))
  );
$$;

INSERT INTO public.admin_emails (email) VALUES ('luiz.algarra@gmail.com.br')
ON CONFLICT (email) DO NOTHING;
