Objetivo: salvar automaticamente cada reels gerado e listá-los numa galeria nova, exclusiva para administradores, em `/postagens`.

## 1. Armazenamento (backend)
- Migração: criar bucket privado `reels-obras` (não público) para os vídeos `.webm`.
- Migração: criar tabela `public.postagens_reels`:
  - `id uuid pk default gen_random_uuid()`
  - `num integer not null` (obra de origem)
  - `titulo text` (título da obra no momento)
  - `video_path text not null` (caminho no bucket)
  - `tamanho_bytes integer`
  - `created_at timestamptz not null default now()`
- GRANTs + RLS: `service_role` ALL; leitura/escrita apenas via funções admin (sem políticas para `anon`/`authenticated`, já que o acesso passa pelas server functions com `garantirAdmin`). Seguindo o padrão das outras tabelas admin do projeto.

## 2. Server functions (`src/lib/admin-obras.functions.ts`)
- `salvarPostagemReels` (POST, `requireSupabaseAuth` + `garantirAdmin`): recebe `num`, `titulo` e o vídeo em base64; faz upload no bucket `reels-obras` (`supabaseAdmin`) e insere a linha em `postagens_reels`. Retorna o registro.
- `listarPostagens` (GET, admin): retorna todas as postagens em ordem decrescente de criação, já com uma URL para reprodução (rota proxy abaixo).
- `removerPostagem` (POST, admin): remove o arquivo do bucket e a linha da tabela.

## 3. Endpoint de vídeo protegido
- Como o bucket é privado e o conteúdo é só para admin, servir o vídeo por uma server function admin que devolve uma signed URL temporária (`createSignedUrl`), em vez de uma rota pública. A galeria usa essa signed URL no `<video>` e no botão Baixar.

## 4. Salvar automaticamente (`src/components/GeradorReels.tsx`)
- Após gerar o blob com sucesso, converter para base64 e chamar `salvarPostagemReels` automaticamente (via `useServerFn`).
- Mostrar estado discreto: "Salvando postagem…" → "Postagem salva". Manter o botão Baixar e o player como hoje. Se o upload falhar, manter o vídeo local e exibir aviso, sem travar o download.

## 5. Nova página `/postagens` (admin)
- `src/routes/postagens.tsx`: galeria geral protegida.
- Adicionar `/postagens` à lista `protegida` em `src/routes/__root.tsx` (já exige login + `isAdmin`).
- Lista em grade de cards: miniatura/player vertical, título da obra, data, botões Baixar e Excluir (com confirmação). Usa TanStack Query (`listarPostagens`) + `useMutation` para `removerPostagem` invalidando a lista.
- Link de acesso: adicionar atalho para `/postagens` onde já há navegação admin (ex.: na página `/admin` e/ou no botão Postar da obra).

## Observações técnicas
- Vídeos `.webm` podem ser grandes; o upload base64 passa pela server function. Caso o tamanho seja um problema na prática, depois dá pra trocar por upload assinado direto ao storage — fora do escopo agora.
- Nenhuma mudança em dados existentes; apenas nova tabela, bucket e funções.