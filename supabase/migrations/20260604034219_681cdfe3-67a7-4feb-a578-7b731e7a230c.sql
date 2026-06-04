CREATE TABLE public.obra_overrides (
  num INTEGER NOT NULL PRIMARY KEY,
  descricao TEXT,
  audio_url TEXT,
  voz_id TEXT NOT NULL DEFAULT 'EXAVITQu4vr4xnSDxMaL',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT ALL ON public.obra_overrides TO service_role;

ALTER TABLE public.obra_overrides ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_obra_overrides_updated_at
BEFORE UPDATE ON public.obra_overrides
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();