CREATE TABLE public.obras_extras (
  num integer NOT NULL PRIMARY KEY,
  titulo text,
  ano text,
  autor text,
  tecnica text,
  dimensao text,
  parede text,
  descricao text,
  imagem_path text,
  audio_url text,
  voz_id text NOT NULL DEFAULT 'EXAVITQu4vr4xnSDxMaL',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.obras_extras TO service_role;
ALTER TABLE public.obras_extras ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER update_obras_extras_updated_at
BEFORE UPDATE ON public.obras_extras
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.obras_ocultas (
  num integer NOT NULL PRIMARY KEY,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.obras_ocultas TO service_role;
ALTER TABLE public.obras_ocultas ENABLE ROW LEVEL SECURITY;