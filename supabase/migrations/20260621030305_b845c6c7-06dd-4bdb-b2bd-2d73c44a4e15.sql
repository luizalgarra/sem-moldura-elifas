CREATE TABLE public.geracoes_audio (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  num integer NOT NULL,
  caracteres integer NOT NULL,
  voz_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.geracoes_audio TO authenticated;
GRANT ALL ON public.geracoes_audio TO service_role;

ALTER TABLE public.geracoes_audio ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read geracoes_audio"
ON public.geracoes_audio
FOR SELECT
TO authenticated
USING (public.is_admin());

CREATE INDEX idx_geracoes_audio_num ON public.geracoes_audio (num);
CREATE INDEX idx_geracoes_audio_created_at ON public.geracoes_audio (created_at DESC);