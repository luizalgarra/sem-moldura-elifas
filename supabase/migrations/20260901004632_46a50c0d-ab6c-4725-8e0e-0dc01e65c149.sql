CREATE TABLE public.ia_config (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  provedor text NOT NULL DEFAULT 'anthropic',
  modelo text NOT NULL DEFAULT 'claude-sonnet-5',
  atualizado_em timestamp with time zone NOT NULL DEFAULT now(),
  atualizado_por uuid
);

GRANT SELECT, INSERT, UPDATE ON public.ia_config TO authenticated;
GRANT ALL ON public.ia_config TO service_role;

ALTER TABLE public.ia_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read ia_config" ON public.ia_config
  FOR SELECT TO authenticated USING (is_admin());
CREATE POLICY "Admins can insert ia_config" ON public.ia_config
  FOR INSERT TO authenticated WITH CHECK (is_admin());
CREATE POLICY "Admins can update ia_config" ON public.ia_config
  FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());

INSERT INTO public.ia_config (id, provedor, modelo) VALUES (1, 'anthropic', 'claude-sonnet-5');