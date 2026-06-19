CREATE TABLE public.obra_versoes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  num integer NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('texto','audio')),
  origem text NOT NULL CHECK (origem IN ('ia','manual')),
  descricao text,
  audio_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, DELETE ON public.obra_versoes TO authenticated;
GRANT ALL ON public.obra_versoes TO service_role;

ALTER TABLE public.obra_versoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read obra_versoes"
  ON public.obra_versoes FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE INDEX idx_obra_versoes_num_tipo ON public.obra_versoes (num, tipo, created_at DESC);