CREATE TABLE public.acervo_ordem (
  chave integer NOT NULL PRIMARY KEY,
  posicao integer NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT ALL ON public.acervo_ordem TO service_role;

ALTER TABLE public.acervo_ordem ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_acervo_ordem_posicao ON public.acervo_ordem (posicao);