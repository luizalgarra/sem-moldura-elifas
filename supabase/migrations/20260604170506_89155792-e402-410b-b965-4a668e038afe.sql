CREATE OR REPLACE FUNCTION public.inserir_na_ordem(p_chave integer, p_posicao integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.acervo_ordem
    SET posicao = posicao + 1, updated_at = now()
    WHERE posicao >= p_posicao;
  INSERT INTO public.acervo_ordem (chave, posicao) VALUES (p_chave, p_posicao);
END;
$$;

CREATE OR REPLACE FUNCTION public.remover_da_ordem(p_chave integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p integer;
BEGIN
  SELECT posicao INTO p FROM public.acervo_ordem WHERE chave = p_chave;
  IF p IS NULL THEN
    RETURN;
  END IF;
  DELETE FROM public.acervo_ordem WHERE chave = p_chave;
  UPDATE public.acervo_ordem
    SET posicao = posicao - 1, updated_at = now()
    WHERE posicao > p;
END;
$$;

GRANT EXECUTE ON FUNCTION public.inserir_na_ordem(integer, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.remover_da_ordem(integer) TO service_role;