ALTER TABLE public.obra_overrides
  ADD COLUMN IF NOT EXISTS titulo text,
  ADD COLUMN IF NOT EXISTS ano text,
  ADD COLUMN IF NOT EXISTS autor text,
  ADD COLUMN IF NOT EXISTS tecnica text,
  ADD COLUMN IF NOT EXISTS dimensao text,
  ADD COLUMN IF NOT EXISTS parede text,
  ADD COLUMN IF NOT EXISTS imagem_path text;