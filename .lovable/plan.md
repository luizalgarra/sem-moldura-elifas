## Diagnóstico

Antes de tudo, esclarecendo a sua pergunta: **a criação do vídeo não usa nenhum modelo de IA** (nem Gemini). É montagem mecânica no navegador, em `src/components/GeradorReels.tsx`:

1. Desenha a imagem da obra num `<canvas>` (fundo borrado + imagem central).
2. Toca o áudio e **grava o canvas em tempo real** com `MediaRecorder` → gera `.webm`.
3. **Converte `.webm` → `.mp4`** com `ffmpeg` em WebAssembly.

A lentidão/travamento no desktop vem de **duas causas**, e nenhuma delas é resolvida só reduzindo resolução:

- **Causa 1 — gravação em tempo real.** O `MediaRecorder` grava pelo tempo exato do áudio. Um áudio de 3 min = 3 min de espera, sempre, independente da máquina.
- **Causa 2 — redesenho por frame.** Há um `requestAnimationFrame` que redesenha o fundo com `blur(40px)` 30×/segundo, mesmo a imagem sendo **estática**. Isso é o que faz a aba travar no Chrome/Edge.

## Solução proposta

Trocar a abordagem de "gravar em tempo real" por **encodar direto no ffmpeg a partir de uma única imagem + o áudio**. Como o vídeo é só uma imagem parada com áudio, não há motivo para gravar em tempo real — o ffmpeg gera o MP4 em uma fração do tempo do áudio.

### O que muda em `GeradorReels.tsx`

1. **Renderizar o quadro uma única vez** no canvas (imagem + fundo borrado), exatamente como hoje, e exportar como PNG (`canvas.toBlob`).
2. **Concatenar o áudio**: baixar os trechos, escrever cada um no sistema de arquivos do ffmpeg e juntá-los (filtro `concat` do ffmpeg), ou renderizar a sequência num único arquivo de áudio.
3. **Encodar o MP4 direto no ffmpeg** a partir do PNG em loop + o áudio:
   - imagem como entrada em loop (`-loop 1`), encerrando no fim do áudio (`-shortest`);
   - `-preset ultrafast`, `-crf 28`, `-pix_fmt yuv420p`, `-movflags +faststart`, 720×1280, ~30fps.
4. **Remover totalmente** o `MediaRecorder`, o `captureStream` e o loop `requestAnimationFrame` de redesenho — eliminando a Causa 2 e a Causa 1 de uma vez.
5. **Progresso real**: usar o evento `progress` do ffmpeg (já existe `conversaoPct`) como única barra de progresso, já que não há mais fase de "gravação".
6. **Manter o salvamento automático** da postagem e o botão de download inalterados.

### Resultado esperado

- Sem espera de "tempo real" — o vídeo é gerado em segundos a poucos segundos, não no tempo do áudio.
- Sem travamento da aba (acabou o blur 30×/s).
- MP4 final idêntico no visual ao atual (mesma composição de imagem e áudio).

### Risco / fallback

- Se a concatenação de áudio no ffmpeg falhar para algum formato específico, mantenho um fallback que renderiza o áudio concatenado via Web Audio (OfflineAudioContext → WAV) antes de entregar ao ffmpeg.
- A resolução 720×1280 e os parâmetros de encode permanecem ajustáveis caso você queira priorizar qualidade ou tamanho do arquivo depois.

## Detalhes técnicos

- Arquivo único afetado: `src/components/GeradorReels.tsx` (lógica de geração).
- Nenhuma mudança de backend, banco ou rotas.
- Dependências `@ffmpeg/ffmpeg` e `@ffmpeg/util` já estão no projeto; nada novo a instalar.
- Opcional (ganho extra de velocidade do ffmpeg via build multi-thread) **não** será usado, pois depende de cabeçalhos de cross-origin isolation no host, fora do nosso controle confiável aqui.
