CREATE TABLE public.postagens_reels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  num integer NOT NULL,
  titulo text,
  video_path text NOT NULL,
  tamanho_bytes integer,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.postagens_reels TO service_role;

ALTER TABLE public.postagens_reels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read postagens_reels"
  ON public.postagens_reels FOR SELECT
  TO authenticated
  USING (public.is_admin());