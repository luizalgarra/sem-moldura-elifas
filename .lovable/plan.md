## Objetivo

Permitir gerar reels de **várias obras de uma vez, em sequência**, em vez de obra por obra. Como a montagem do vídeo roda **no navegador** (canvas + ffmpeg WebAssembly — sem IA, sem custo de IA), o lote também roda no navegador: uma página processa as obras uma a uma, gera o MP4 de cada uma e salva automaticamente, mostrando o progresso. A aba precisa ficar aberta até terminar.

## Como vai funcionar

Nova página de administração `/postar` (lista geral, só admin). Ela carrega o acervo na ordem oficial e mostra a lista de obras com: quais têm **imagem + áudio** (aptas) e quantos reels cada uma já possui.

Controles do lote, atendendo ao seu pedido ("a partir da 01 Gabriela, gerar 10"):

```text
Gerar reels em lote
Começar a partir de:  [ 01 — Gabriela ▾ ]   (dropdown com todas as obras)
Quantidade:           [ 10 ]                 (ou “até o fim”)
[x] Pular obras que já têm vídeo

[ Gerar (10 obras) ]   [ Pausar ]   [ Cancelar ]

Progresso: ███████░░░░░░  4/10
✓ 02  Sem título …        salvo
⏳ 03  Operários …         gerando MP4 62%
•  04  ...                 na fila
⚠ 05  ...                  sem áudio (pulada)
```

Comportamento:
1. A partir da obra escolhida, processa **uma por vez** as próximas N aptas.
2. Para cada obra: monta a imagem no canvas → concatena o áudio → encoda o MP4 → salva a postagem automaticamente (mesma lógica de hoje).
3. **Pular as que já têm vídeo** (padrão ligado) evita duplicar; pode desligar para refazer.
4. Se uma obra falhar, registra o erro e **segue para a próxima** (não trava o lote).
5. **Pausar** e **Cancelar** disponíveis a qualquer momento.
6. Resumo final: geradas / puladas / com erro, e botão **"tentar de novo só as que falharam"**.

## Detalhes técnicos

- **Reaproveitar a lógica existente** de `src/components/GeradorReels.tsx`: extrair a montagem (carregar imagem → desenhar no canvas → PNG → concatenar áudio → ffmpeg → MP4 → base64 → salvar) para um módulo compartilhado `src/lib/gerar-reels.ts`, com uma função tipo `gerarReelsDaObra(obra, { canvas, onProgress })` que retorna o `Blob`/base64. O `GeradorReels` atual passa a usar essa mesma função (sem mudança no uso individual).
- **Nova rota** `src/routes/postar.index.tsx` (`/postar`):
  - `useServerFn(listarAcervo)` + `useQuery` para a lista de obras;
  - estado do lote (fila, índice atual, pausado, cancelado, resultados) em `useState`/`useRef`;
  - **um único** `<canvas>` oculto e a **mesma instância** de ffmpeg (já cacheada em módulo) reutilizados entre as obras, para não recarregar o WASM a cada item;
  - loop `for ... await` (sequencial real, nada de `Promise.all`).
- **Contagem eficiente do que já existe**: nova server function `contarPostagensPorObra` em `src/lib/admin-obras.functions.ts`, admin-only, que retorna `{ [num]: total }` de todas as obras numa só consulta — em vez de uma chamada por obra. Usa o mesmo padrão das funções existentes (`requireSupabaseAuth` + `ehAdmin` + `supabaseAdmin`).
- **Aptidão**: obra entra na fila se tiver `imagem` e algum áudio (`audioTrechos` ou `audioFem/audio/audioMasc`); as demais aparecem como "sem mídia" e são puladas.
- **Salvamento**: usa `salvarPostagemReels` já existente (upload no bucket `reels-obras` + registro em `postagens_reels`). Sem mudança de schema; só a função de contagem é nova.
- **Acesso admin**: a página verifica `useAdminAuth` (como `/postar/$num` já faz) e as server functions já exigem admin.

## Limitações honestas

- O lote roda **no navegador do admin**: a aba precisa ficar aberta e o computador ligado até o fim. Para ~10 obras é rápido (cada vídeo sai em segundos).
- Navegadores desaceleram abas em segundo plano; recomendo deixar a aba em foco durante o lote (não quebra, só fica mais lento).
- Continua **sem IA e sem custo de créditos de IA** por vídeo; só uso de armazenamento ao salvar os MP4.

## Arquivos afetados

- Novo: `src/lib/gerar-reels.ts` — lógica de montagem compartilhada.
- Novo: `src/routes/postar.index.tsx` — página `/postar` com o lote.
- Editar: `src/components/GeradorReels.tsx` — passa a usar `gerar-reels.ts`.
- Editar: `src/lib/admin-obras.functions.ts` — nova `contarPostagensPorObra`.
- Sem migrações (bucket e tabela já existem).
