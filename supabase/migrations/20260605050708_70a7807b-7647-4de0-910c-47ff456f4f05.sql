ALTER TABLE public.obra_overrides ADD COLUMN IF NOT EXISTS audio_trechos jsonb;
ALTER TABLE public.obras_extras ADD COLUMN IF NOT EXISTS audio_trechos jsonb;