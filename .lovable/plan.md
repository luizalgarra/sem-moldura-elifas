# Baixar os reels em MP4

Hoje o reels é gravado no navegador via `MediaRecorder`, que só produz `.webm`. Como o backend roda em ambiente edge (sem ffmpeg), a conversão para MP4 será feita no próprio navegador com **ffmpeg.wasm**. O arquivo MP4 resultante será usado tanto no botão **Baixar** quanto no upload para a galeria `/postagens`.

## O que muda

### 1. Conversão no navegador (`src/components/GeradorReels.tsx`)
- Adicionar a dependência `@ffmpeg/ffmpeg` + `@ffmpeg/util` (build single-thread, que não exige isolamento de origem/SharedArrayBuffer).
- Após gerar o `Blob` webm atual, rodar uma etapa de conversão:
  - Carregar o ffmpeg.wasm sob demanda (só na 1ª conversão, com cache em ref).
  - Converter `webm` → `mp4` (codec H.264 + AAC), mantendo 1080x1920.
- Novo estado de interface entre "gerando" e "pronto": **"Convertendo para MP4…"** com indicador, já que leva alguns segundos e baixa ~30MB na primeira vez.
- O `videoUrl` do player e o `download` passam a apontar para o blob MP4.
- Trocar o atributo de download de `obra-${num}-reels.webm` para `obra-${num}-reels.mp4`.
- O preview `<video>` reproduz o MP4.
- Tratamento de falha: se a conversão falhar, manter o webm como fallback para download/preview e exibir aviso discreto, sem travar o fluxo.

### 2. Salvar a galeria em MP4 (`src/lib/admin-obras.functions.ts`)
- Em `salvarPostagemReels`: o componente passa a enviar o base64 do **MP4**. Ajustar:
  - `path` de `reels-${num}-${Date.now()}.webm` → `.mp4`.
  - `contentType` de `video/webm` → `video/mp4`.
- `listarPostagens` e `removerPostagem` continuam iguais (operam pelo `video_path` gravado).
- Postagens antigas em `.webm` continuam funcionando normalmente (o caminho fica salvo no banco); apenas as novas serão `.mp4`.

### 3. Galeria `/postagens` (`src/routes/postagens.tsx`)
- Ajustar o atributo `download` dos cards para usar extensão `.mp4` (derivada do `video_path`/título), garantindo nome de arquivo correto ao baixar.

## Detalhes técnicos

- **ffmpeg.wasm single-thread**: usa-se o core `@ffmpeg/core` (não o `-mt`) para evitar a exigência de cabeçalhos COOP/COEP no preview. O `load()` aponta para os assets via `toBlobURL` (CDN do unpkg) para não precisar configurar o servidor.
- **Comando de conversão** (aprox.): entrada `in.webm`, saída `out.mp4` com `-c:v libx264 -preset veryfast -pix_fmt yuv420p -c:a aac`. Resultado amplamente compatível (Instagram/WhatsApp/iOS).
- **Carregamento sob demanda**: o ffmpeg só é importado/baixado quando o usuário gera o primeiro vídeo, mantendo o restante da página leve.
- **Sem mudanças de schema/RLS**: a tabela `postagens_reels` e o bucket `reels-obras` permanecem como estão.

```text
Gerar vídeo (canvas+áudio) ─► Blob WEBM ─► ffmpeg.wasm ─► Blob MP4
                                                          ├─► Baixar (.mp4)
                                                          ├─► Preview <video>
                                                          └─► salvarPostagemReels (base64 → storage .mp4)
```
