## Objetivo

Manter a saída em **MP4** (FFmpeg.wasm), mas eliminar o travamento em "Carregando conversor" tornando o carregamento do conversor **estável e local**, sem depender de CDN externo nem de versões incompatíveis.

## Causa do problema

O `obterFFmpeg()` baixa ~30 MB de WebAssembly de um CDN (`cdn.jsdelivr.net`) toda vez e ainda mistura versões (`@ffmpeg/core@0.12.10` + `worker.js@0.12.15`). Esse download remoto trava de forma intermitente e, quando o servidor de desenvolvimento reinicia (HMR), a aba recarrega no meio do carregamento — exatamente o que você viu.

## Solução

Auto-hospedar os arquivos do FFmpeg dentro do próprio projeto (`public/`), com versões casadas, e carregá-los de URLs locais. Sem rede externa, sem mismatch, carregamento rápido e estável.

### 1. Baixar os arquivos do conversor para dentro do projeto
Colocar em `public/ffmpeg/` (single-thread, não exige headers especiais), todos da **mesma versão**:
- `ffmpeg-core.js`
- `ffmpeg-core.wasm`
- `814.ffmpeg.js` / `worker.js` (worker correspondente ao pacote `@ffmpeg/ffmpeg` instalado)

Os arquivos virão das versões já instaladas em `node_modules` (`@ffmpeg/core` e `@ffmpeg/ffmpeg`), garantindo compatibilidade exata com o que o app importa.

### 2. Ajustar `src/lib/gerar-reels.ts`
- Trocar as URLs do CDN por caminhos locais (`/ffmpeg/ffmpeg-core.js`, `/ffmpeg/ffmpeg-core.wasm`, worker local) em `ffmpeg.load()`.
- Manter `toBlobURL` (necessário para o worker), mas agora apontando para os arquivos locais.
- Adicionar um **timeout de segurança** (ex.: 60s) no `ffmpeg.load()`: se não inicializar, lança erro claro em vez de ficar preso para sempre, e libera o botão para tentar de novo.
- Manter `ffmpegPromise` em cache para reaproveitar a instância entre as obras do lote.

### 3. Validar a geração de verdade
Rodar uma obra real em `/postar`, confirmar que o status sai de "Carregando conversor" para "Gerando MP4 …%" e termina em "Salvo", e que a postagem aparece em `/postagens`.

## Detalhes técnicos

- Usar o core **single-thread** (`@ffmpeg/core`), que não precisa de `SharedArrayBuffer` nem de headers COOP/COEP — portanto funciona no preview e no site publicado sem configuração de servidor.
- Os `.wasm` ficam como **assets estáticos** em `public/ffmpeg/` e são carregados apenas no cliente (após hidratação), nunca no bundle de servidor/SSR.
- Nenhuma mudança na lógica de áudio, canvas, salvamento ou na UI de lote — só o carregamento do FFmpeg muda.

## Arquivos afetados
- `public/ffmpeg/*` (novos — arquivos do conversor)
- `src/lib/gerar-reels.ts` (editar `obterFFmpeg` para caminhos locais + timeout)
