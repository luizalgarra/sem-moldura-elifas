-- A migration 20260613225048 cadastrou o administrador como
-- 'luiz.algarra@gmail.com.br' — endereço @gmail.com com .br no fim.
--
-- Consequência: is_admin() compara o e-mail do usuário logado com essa lista e
-- nunca encontra correspondência, então o painel de administração do catálogo
-- fica inacessível para o dono do projeto.
--
-- Corrigido aqui, e não editando a migration original, para o histórico
-- continuar refletindo o que de fato aconteceu em cada banco.

INSERT INTO public.admin_emails (email)
VALUES ('luiz.algarra@gmail.com')
ON CONFLICT (email) DO NOTHING;

DELETE FROM public.admin_emails WHERE email = 'luiz.algarra@gmail.com.br';