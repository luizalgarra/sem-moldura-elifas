create table if not exists public.agente_config (
  id integer primary key default 1,
  instrucoes text,
  regras_extras text,
  temperatura numeric not null default 0.7,
  max_tokens integer not null default 1024,
  modelo_etapa_a text,
  modelo_etapa_b text,
  modelo_fallback text,
  atualizado_em timestamptz not null default now(),
  atualizado_por uuid,
  constraint agente_config_unica check (id = 1)
);

GRANT SELECT, INSERT, UPDATE ON public.agente_config TO authenticated;
GRANT ALL ON public.agente_config TO service_role;

ALTER TABLE public.agente_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read agente_config"
  ON public.agente_config FOR SELECT TO authenticated USING (is_admin());

CREATE POLICY "Admins can insert agente_config"
  ON public.agente_config FOR INSERT TO authenticated WITH CHECK (is_admin());

CREATE POLICY "Admins can update agente_config"
  ON public.agente_config FOR UPDATE TO authenticated USING (is_admin()) WITH CHECK (is_admin());