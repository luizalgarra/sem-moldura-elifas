-- Reforça inserir_na_ordem com verificação interna de admin
CREATE OR REPLACE FUNCTION public.inserir_na_ordem(p_chave integer, p_posicao integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores.';
  END IF;
  UPDATE public.acervo_ordem
    SET posicao = posicao + 1, updated_at = now()
    WHERE posicao >= p_posicao;
  INSERT INTO public.acervo_ordem (chave, posicao) VALUES (p_chave, p_posicao);
END;
$function$;

-- Reforça remover_da_ordem com verificação interna de admin
CREATE OR REPLACE FUNCTION public.remover_da_ordem(p_chave integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  p integer;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores.';
  END IF;
  SELECT posicao INTO p FROM public.acervo_ordem WHERE chave = p_chave;
  IF p IS NULL THEN
    RETURN;
  END IF;
  DELETE FROM public.acervo_ordem WHERE chave = p_chave;
  UPDATE public.acervo_ordem
    SET posicao = posicao - 1, updated_at = now()
    WHERE posicao > p;
END;
$function$;

-- Remove permissão de execução para visitantes não autenticados
REVOKE EXECUTE ON FUNCTION public.inserir_na_ordem(integer, integer) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.remover_da_ordem(integer) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon, public;

-- Garante execução apenas para usuários autenticados (protegidos por checagem interna)
GRANT EXECUTE ON FUNCTION public.inserir_na_ordem(integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remover_da_ordem(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;