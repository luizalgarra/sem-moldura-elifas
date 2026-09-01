CREATE TABLE public.ia_uso (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provedor text NOT NULL,
  modelo text NOT NULL,
  tokens_entrada integer NOT NULL DEFAULT 0,
  tokens_saida integer NOT NULL DEFAULT 0,
  ms integer NOT NULL DEFAULT 0,
  origem text NOT NULL DEFAULT 'conversa',
  ok boolean NOT NULL DEFAULT true,
  erro text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.ia_uso TO authenticated;
GRANT ALL ON public.ia_uso TO service_role;

ALTER TABLE public.ia_uso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read ia_uso" ON public.ia_uso FOR SELECT TO authenticated USING (is_admin());

CREATE INDEX ia_uso_created_at_idx ON public.ia_uso (created_at DESC);
CREATE INDEX ia_uso_modelo_idx ON public.ia_uso (modelo);