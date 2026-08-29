-- Lista de espera da Rede Além da Moldura.
--
-- SEGURANÇA: a tabela guarda nome, e-mail e o vínculo da pessoa com o IEA.
-- RLS fica ligada e SEM nenhuma policy: nem anon nem authenticated leem ou
-- escrevem. O único acesso é pela service_role, usada na função de servidor
-- inscreverNaListaDeEspera. Assim a lista nunca fica exposta pelo cliente.

CREATE TABLE public.rede_lista_espera (
  id UUID NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  vinculo TEXT,
  convidado_por TEXT,
  origem TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Um e-mail entra uma vez só, sem depender de maiúsculas.
CREATE UNIQUE INDEX rede_lista_espera_email_unico
  ON public.rede_lista_espera (lower(email));

GRANT ALL ON public.rede_lista_espera TO service_role;

ALTER TABLE public.rede_lista_espera ENABLE ROW LEVEL SECURITY;
