# Subir os 4 vídeos e aplicar nas obras

## O que são os arquivos
São 4 vídeos horizontais (1920×1080, ~1m30 cada, com áudio) do próprio Elifas Andreato narrando e apresentando cada obra. Identifiquei o assunto de cada um pelo conteúdo (os nomes dos arquivos enviados eram genéricos: `20852`, `20854`, `20856`).

## Mapeamento proposto (obra de destino)
| Arquivo | Assunto identificado | Obra de destino |
|---|---|---|
| `Bandalhismo - João Bosco.mov` | Bandalhismo | **106 — Video 3, Bandalhismo** |
| `20854` | João Nogueira (escultura entalhada) | **113 — Video 10, João Nogueira** |
| `20852` | Beth Carvalho (capa "Alma do Brasil", bonecos de papel) | **54 — Alma do Brasil, Beth Carvalho** |
| `20856` | Paulinho da Viola (capa com violão) | **65 — Paulinho da Viola** |

> Se algum destino estiver errado, é só me avisar o número correto antes de eu aplicar — o restante do fluxo é idêntico.

## Passos

1. **Transcodificar** os 4 vídeos para MP4 web-friendly (H.264 + AAC, ~720p, bitrate moderado). Os originais têm ~200 MB cada; após a compressão ficam bem menores, carregam rápido no site e cabem no fluxo de upload. O `.mov` também passa a MP4.

2. **Enviar** cada MP4 para o bucket `reels-obras` (privado, igual aos reels atuais) e **registrar** uma linha em `postagens_reels` com o número da obra, título e o caminho do arquivo. A partir daí a função pública `getVideoObra` já passa a servir o vídeo na página da obra — sem novo código de leitura.

3. **Ajustar o player para 16:9** (sua escolha). Como os reels já existentes (obras 1–20) são verticais 9:16, vou:
   - Guardar a largura/altura de cada vídeo ao registrá-lo (duas colunas novas em `postagens_reels`, opcionais).
   - Fazer `getVideoObra` devolver essa proporção.
   - No player de `src/routes/obras.$num.tsx`, escolher automaticamente o formato: **16:9 em contêiner largo** para os vídeos horizontais e **9:16 estreito** para os reels verticais já existentes. Vídeos antigos sem essa informação continuam como vertical (comportamento atual).

## Detalhes técnicos
- Migração: adicionar `largura int` e `altura int` (nullable) em `public.postagens_reels`.
- Atualizar `getVideoObra` e a interface `VideoObra` para incluir `largura`/`altura`.
- No player, derivar `aspect-[16/9]`/largura `max-w-2xl` quando horizontal e manter `aspect-[9/16]`/`max-w-xs` quando vertical ou desconhecido.
- Upload via storage com a chave de serviço (mesmo bucket e padrão de nome `reels-{num}-{timestamp}.mp4` já usado).
- Os arquivos enviados não ficam no repositório — só vão para o storage.

## Fora do escopo
- Não vou alterar o gerador de reels nem a galeria `/postagens` (continuam funcionando).
- Não vou regenerar áudio/audiodescrição dessas obras.
