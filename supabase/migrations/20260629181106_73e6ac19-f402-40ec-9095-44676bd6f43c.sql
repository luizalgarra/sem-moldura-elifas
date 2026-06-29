ALTER TABLE public.postagens_reels
  ADD COLUMN IF NOT EXISTS largura integer,
  ADD COLUMN IF NOT EXISTS altura integer;