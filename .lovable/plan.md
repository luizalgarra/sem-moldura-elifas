# MP4 mais rápido (720×1280)

Reduzir a resolução do reels de 1080×1920 para **720×1280** para acelerar a conversão para MP4 no navegador (menos da metade dos pixels = encode bem mais rápido), mantendo o formato vertical 9:16 e qualidade nítida para redes sociais.

## O que muda para o usuário

- O vídeo gerado passa a sair em **720×1280** (mesma proporção 9:16, continua adequado para Reels/Stories).
- A etapa **"Convertendo para MP4…"** fica significativamente mais rápida.
- A gravação em tempo real continua durando o tempo do áudio (isso não muda, pois é a captura ao vivo do canvas).
- Nada mais muda no fluxo: gerar, baixar em MP4, salvar e galeria seguem iguais.

## Passos técnicos

### `src/components/GeradorReels.tsx`
- Alterar as constantes `LARGURA` e `ALTURA` de `1080 / 1920` para `720 / 1280`.
- O restante do desenho (fundo blur "cover" + imagem "contain") já usa essas constantes, então se ajusta automaticamente.
- Manter `converterParaMp4` com `libx264 / veryfast`; a menor resolução por si só já reduz bastante o tempo. Opcional (sem alterar qualidade percebida): manter o preset atual.

## Observações
- Não há mudança de banco de dados nem de funções de servidor.
- O fallback para `.webm` (quando a conversão falha) continua funcionando, agora também em 720×1280.