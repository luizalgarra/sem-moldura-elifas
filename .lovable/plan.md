## Objetivo
Exibir, na página pública de cada obra (`/obras/$num`), o vídeo (reels) gerado para ela — quando existir. Hoje os reels só aparecem na área admin `/postagens`; a página da obra mostra apenas imagem, áudio e audiodescrição.

## Situação atual
- Os vídeos ficam no bucket privado `reels-obras` e registrados em `postagens_reels`.
- As únicas funções que leem reels (`listarPostagens`, etc.) exigem admin (`requireSupabaseAuth` + `garantirAdmin`), então não podem ser usadas em rota pública/SSR.
- Existem reels para as obras 1–20; as demais simplesmente não terão vídeo (e a seção não aparece).

## Mudanças

### 1. Nova função pública de leitura — `src/lib/admin-obras.functions.ts`
Adicionar `getVideoObra` (`createServerFn`, GET, **sem** `requireSupabaseAuth` — é leitura pública):
- Recebe `{ num }` validado por Zod.
- Carrega `supabaseAdmin` dentro do handler.
- Busca em `postagens_reels` a postagem mais recente daquela obra (`order created_at desc, limit 1`), selecionando só `video_path` e `titulo`.
- Gera uma URL assinada do bucket `reels-obras` (validade ~1h).
- Retorna `{ url, ext } | null`. Nenhuma coluna sensível é exposta — apenas a URL assinada do vídeo.

Observação de segurança: a função é pública de propósito (mesma lógica de `getObraPublica`/`listarAcervo` que já alimentam o site). Continua usando `supabaseAdmin` só para gerar a URL assinada, sem expor o bucket nem dados privados.

### 2. Carregar o vídeo no loader — `src/routes/obras.$num.tsx`
- No `loader`, além de `listarAcervo()`, chamar `getVideoObra({ data: { num } })` em paralelo.
- Incluir `video` no retorno do loader (`{ obra, total, video }`).

### 3. Renderizar o player na página da obra
- Quando `video?.url` existir, exibir uma nova seção "Vídeo" (reels 9:16) logo abaixo da imagem/ficha, com um `<video controls playsInline>` apontando para a URL assinada, em um contêiner com largura limitada (formato vertical) e cantos arredondados seguindo os tokens do tema.
- Quando não houver vídeo, nada é renderizado (sem placeholder).

## Detalhes técnicos
- `getVideoObra` segue a ordem do builder: `createServerFn` → `.inputValidator()` → `.handler()`; sem middleware (leitura pública), import dinâmico de `client.server` dentro do handler.
- O `num` usado é o número exibido da obra (mesmo critério usado ao gerar o reels em `/postar`), garantindo correspondência.
- Player nativo HTML5; sem dependências novas.

## Fora de escopo
- Tornar o bucket público (mantemos privado, servindo via URL assinada).
- Gerar reels para as obras 21–117 (estas continuam sem vídeo até serem geradas).
</content>
<summary>Exibir o reels de cada obra na página pública /obras/$num via uma função de leitura pública que gera URL assinada do bucket privado.</summary>
</invoke>
