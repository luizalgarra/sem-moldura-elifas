# Botão POSTAR + gerador de reels (admin)

Adicionar, **somente para admins**, um botão "Postar" na página da obra (`/obras/$num`) que leva a uma nova página onde o vídeo (reels 9:16) é montado **no navegador** a partir da imagem estática + áudio, com fundo borrado, pronto para download.

## Por que no navegador
O backend roda em ambiente edge (sem ffmpeg/child_process), então não dá para montar vídeo no servidor. A solução roda no navegador do admin usando `<canvas>` + Web Audio + `MediaRecorder`. Saída em `.webm` (aceito por Instagram/TikTok). É necessário que o admin clique para gravar (gravação acontece em tempo real, em segundo plano).

## Mudanças

### 1. Botão "Postar" na página da obra — `src/routes/obras.$num.tsx`
- Usar `useAdminAuth()` para obter `isAdmin`.
- Quando `isAdmin` for verdadeiro, exibir um botão "Postar" (ícone de vídeo/share) logo abaixo do player de áudio-descrição.
- O botão é um `<Link to="/postar/$num" params={{ num }}>` (visitantes comuns nunca veem o botão; não há dado sensível exposto).

### 2. Nova rota `/postar/$num` — `src/routes/postar.$num.tsx`
- Proteção de UI: adicionar o prefixo `/postar` à lista `protegida` em `src/routes/__root.tsx` (exige login + isAdmin, igual a `/admin`, `/editar`, `/qrcodes`).
- O loader reusa `listarAcervo()` (já público, sem auth) e localiza a obra pelo `num`; `notFound()` se não existir.
- Mostra: prévia da obra, seletor de áudio, botão "Gerar vídeo" e, ao final, botão "Baixar".

### 3. Seleção do áudio (decidir na hora)
Quando a obra tiver vários trechos (`obra.audioTrechos`), a página oferece:
- **Sequência completa** (todos os trechos, na ordem) — padrão.
- **Apenas o 1º trecho**.
- Quando houver só um arquivo único (`audioFem`/`audio`/`audioMasc`), usa esse arquivo direto.
Obras sem áudio gerado mostram aviso e não geram vídeo.

### 4. Montagem do vídeo (frontend)
Componente cliente (ex.: `src/components/GeradorReels.tsx`):
1. Carrega a imagem da obra (`obra.imagem`) e os áudios escolhidos.
2. Cria `<canvas>` 1080x1920. A cada frame desenha:
   - **Fundo**: a própria imagem ampliada com `filter: blur(...)` cobrindo todo o quadro (efeito cinematográfico).
   - **Frente**: a imagem da obra contida (`object-contain`) centralizada.
   - **Sem texto sobreposto** (conforme escolhido).
3. Concatena os áudios escolhidos via Web Audio API (`AudioContext` + buffers) num único stream; conecta a `MediaStreamAudioDestinationNode`.
4. `canvas.captureStream(30)` + faixa de áudio do destination → `MediaRecorder` (`video/webm;codecs=vp9,opus`, com fallback de mimeType).
5. Toca o áudio e grava em tempo real; ao terminar o áudio, finaliza a gravação.
6. Gera `Blob` → URL → botão "Baixar" com nome `obra-<num>-reels.webm`. Mostra prévia em `<video>`.

CORS de áudio/imagem: as mídias vêm de `/api/public/obra-imagem/$num` e `/api/public/obra-audio/$num` (mesma origem), então `captureStream`/Web Audio funcionam sem taint de canvas.

## Detalhes técnicos
- Nenhuma mudança de banco, RLS ou server function. Tudo reaproveita `listarAcervo()` e os endpoints públicos de imagem/áudio já existentes.
- Compatibilidade: `MediaRecorder` e `captureStream` funcionam em Chrome/Edge/Firefox; o componente detecta suporte e exibe aviso se indisponível (ex.: Safari mais antigo). Aviso na página de que a aba precisa ficar em primeiro plano durante a gravação.
- Saída `.webm`. Caso no futuro queira `.mp4` garantido, seria necessário um serviço externo de transcodificação — fora deste escopo.

## Arquivos
- `src/routes/obras.$num.tsx` — botão "Postar" condicional a admin.
- `src/routes/__root.tsx` — adicionar `/postar` à lista `protegida`.
- `src/routes/postar.$num.tsx` — nova página (loader + UI).
- `src/components/GeradorReels.tsx` — lógica de canvas/áudio/MediaRecorder.
