# Site 100% público + admin protegido de verdade

## Situação atual

O site **já é público** para visitantes: o portão de login em `src/routes/__root.tsx` só protege as rotas `/admin`, `/editar` e `/qrcodes`. Todas as páginas de conteúdo (obras, acervo, biografia, etc.) abrem sem login, e o site publicado está com visibilidade pública.

Porém há uma falha importante: as funções de servidor que **criam, editam, removem e geram áudio/texto** (em `src/lib/admin-obras.functions.ts`) usam a chave de serviço e **não verificam se quem chamou é admin**. O portão de `__root.tsx` apenas esconde a tela — qualquer pessoa poderia chamar esses endpoints diretamente no site publicado e alterar o acervo ou gastar créditos de geração de voz/IA.

O objetivo é deixar isso correto nos dois sentidos: **visitantes nunca veem login** e **as ações de admin só funcionam para admin de verdade**.

## O que será feito

### 1. Confirmar acesso público dos visitantes (sem mudança de comportamento)
- Manter o portão de login restrito apenas a `/admin`, `/editar` e `/qrcodes`.
- Confirmar que as funções de leitura pública (`listarAcervo`, `getObraPublica`) e as rotas de mídia pública continuam abertas, sem exigir sessão.

### 2. Blindar as funções de administração
Adicionar verificação de papel admin nas funções que escrevem ou custam créditos, para que o papel de admin realmente proteja essas áreas (e não só a interface):
- `criarObra`, `removerObra`
- `salvarDados`, `salvarImagem`, `salvarTexto`
- `gerarTextoDescricao`, `regenerarAudio`

Cada uma passará a exigir um usuário autenticado e com permissão de admin antes de executar. Sem isso, retornam "não autorizado".

### 3. Manter o que já funciona
- Páginas públicas, players de áudio, QR Codes para visitantes, navegação e a home continuam iguais.
- As telas de admin (`/admin`, `/editar`, `/qrcodes`) seguem exigindo login + papel admin.

## Detalhes técnicos

- Em `src/lib/admin-obras.functions.ts`, aplicar o middleware `requireSupabaseAuth` (de `@/integrations/supabase/auth-middleware`) nas funções de escrita e, dentro do handler, validar o papel admin via `context.supabase.rpc("is_admin")`, lançando `Response("Não autorizado", { status: 401 })` quando falso.
- O `attachSupabaseAuth` já está registrado em `src/start.ts` como `functionMiddleware`, então o token do admin é anexado automaticamente nas chamadas — nenhuma mudança extra de wiring é necessária.
- Como `/admin`, `/editar` e `/qrcodes` só são acessíveis a admin logado, essas chamadas continuarão funcionando normalmente para o admin; apenas chamadas não autenticadas passam a ser barradas.
- Funções de leitura pública (`listarAcervo`, `getObraPublica`) permanecem sem middleware para não afetar visitantes.

## Fora de escopo
- Não altera a home "Em construção" nem o conteúdo das páginas.
- Não muda regras de RLS nem o esquema do banco.
