-- O campo aberto "Quem convidou você?" virou uma escolha entre quatro perfis,
-- sob o rótulo "Quero um convite". A coluna passa a guardar o perfil escolhido,
-- não um nome de quem convidou.
ALTER TABLE public.rede_lista_espera RENAME COLUMN convidado_por TO perfil;
