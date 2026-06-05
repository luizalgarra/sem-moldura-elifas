ALTER TABLE public.obra_overrides
  ADD COLUMN IF NOT EXISTS audio_fem_path text,
  ADD COLUMN IF NOT EXISTS audio_masc_path text;

ALTER TABLE public.obras_extras
  ADD COLUMN IF NOT EXISTS audio_fem_path text,
  ADD COLUMN IF NOT EXISTS audio_masc_path text;