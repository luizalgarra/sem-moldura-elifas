---
name: acesso-publico-admin
description: Modelo de acesso do catálogo Elifas Andreato — site 100% público para visitantes e ações de admin protegidas. Use ao criar/editar rotas, server functions ou ao revisar quem pode ver ou alterar o acervo. Triggers "público", "sign-in", "login", "admin", "proteger", "acesso restrito".
---

# Acesso público + admin protegido (catálogo Elifas Andreato)

## Quando usar
- Criar ou editar rotas que devem ficar visíveis a qualquer visitante (obras, acervo, biografia, etc.).
- Criar ou editar `createServerFn` que escrevem dados ou consomem créditos (texto IA, voz ElevenLabs).
- Revisar se uma página exige login indevidamente, ou se um endpoint de admin está exposto.

## Regra dos dois lados
O catálogo é **público para visitantes** e **restrito para administração**. As duas coisas são independentes e ambas precisam estar corretas:

1. **Visitante nunca vê login.** Conteúdo é público.
2. **Ação de admin nunca roda sem admin.** Não basta esconder a tela — o endpoint precisa validar o papel.

## Portão de rota (UI) — `src/routes/__root.tsx`
A constante `protegida` lista os únicos prefixos que exigem sessão + `isAdmin`:
`/admin`, `/editar`, `/qrcodes`. Tudo o mais é público.

- Para tornar uma área pública: garanta que o prefixo **não** esteja nesse `protegida`. Nunca adicione `beforeLoad` redirecionando para `/auth` em rota pública de topo — em SSR/prerender não há sessão e a build quebra.
- Para tornar uma área admin: adicione o prefixo a `protegida` (a UI já exige login + `isAdmin` via `is_admin` RPC).

O portão de rota só **esconde a interface**. Ele NÃO protege os endpoints — por isso a camada abaixo é obrigatória.

## Proteção real — server functions em `src/lib/admin-obras.functions.ts`
Funções que escrevem/custam créditos usam `supabaseAdmin` (service role, ignora RLS). Sem checagem, são endpoints públicos no site publicado. Padrão obrigatório:

```ts
export const minhaAcao = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])        // 1. exige usuário autenticado
  .inputValidator((input: unknown) => schema.parse(input))
  .handler(async ({ data, context }) => {
    await garantirAdmin(context);           // 2. exige papel admin (is_admin RPC)
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // ... lógica privilegiada
  });
```

- `garantirAdmin(context)` chama `context.supabase.rpc("is_admin")` e lança `Response("Não autorizado", { status: 401 })` se não for admin. Já existe no arquivo; reutilize.
- Ordem do builder: `.middleware()` → `.inputValidator()` → `.handler()`. Inverter quebra os tipos.
- Chame essas funções via `useServerFn` em componentes/handlers das telas admin (`/editar`, `/admin`). O `attachSupabaseAuth` (já registrado em `src/start.ts`) anexa o token automaticamente.

## Leituras públicas ficam SEM middleware
`listarAcervo` e `getObraPublica` alimentam loaders de rotas públicas (SSR). Não coloque `requireSupabaseAuth` nelas — o prerender roda sem token e a build falha com 401. Loaders públicos só podem chamar funções sem auth.

## Checklist ao adicionar uma server function nova
- Escreve dados ou gasta créditos? → `requireSupabaseAuth` + `garantirAdmin`.
- Só lê dados que o público pode ver? → sem middleware; nunca exponha colunas sensíveis.
- Vai ser chamada em loader de rota pública? → deve ser sem auth.
