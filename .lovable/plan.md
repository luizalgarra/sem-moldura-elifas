# Importar vídeos do Google Drive para as obras

Trazer os 9 vídeos MP4 recentes do Google Drive (Luiz's Google Drive), otimizá-los para web e vinculá-los às obras correspondentes do acervo, reaproveitando toda a infraestrutura de vídeo já existente (bucket `reels-obras`, tabela `postagens_reels`, player dinâmico em `/obras/$num`).

## Vídeos a importar

| Arquivo no Drive | Música / Capa |
|---|---|
| Almanaque - Chico Buarque.mp4 | Almanaque (Chico Buarque) |
| Ópera do Malandro.mp4 | Ópera do Malandro (Chico Buarque) |
| Arca de Noé.mp4 | Arca de Noé |
| Bebadosamba.mp4 | Bebadosamba (Paulinho da Viola) |
| Clara - Clara Nunes.mp4 | Clara (Clara Nunes) |
| Clementina - Clementina de Jesus.mp4 | Clementina de Jesus |
| Hoje é dia de festa - Zeca.mp4 | Hoje é dia de festa (Zeca Pagodinho) |
| Tendinha - Martinho da Vila.mp4 | Tendinha (Martinho da Vila) |
| Terreiro - Martinho da Vila.mp4 | Terreiro (Martinho da Vila) |

## Etapas

1. **Mapear vídeo → obra**: cruzar o título de cada vídeo com o acervo (tabelas `obra_overrides` / `obras_extras`) para descobrir o `num` de cada obra. Antes de enviar, apresento a tabela final de mapeamento (vídeo → número da obra) para você confirmar; reaponto qualquer item trocado.

2. **Baixar do Drive**: baixar cada arquivo via gateway do conector Google Drive (`alt=media`), usando o `id` de cada arquivo já listado.

3. **Otimizar para web**: transcodificar com `ffmpeg` para MP4 H.264 720p (~15 MB cada), como fizemos com os 4 vídeos anteriores. Detectar a proporção real (16:9 ou 9:16) para gravar `largura`/`altura`.

4. **Enviar ao bucket**: upload de cada vídeo para o bucket privado `reels-obras` (mesmo padrão dos vídeos atuais).

5. **Registrar no banco**: inserir/atualizar em `postagens_reels` (`num`, `titulo`, `video_path`, `tamanho_bytes`, `largura`, `altura`) para cada obra. Se já houver registro para a obra, substituo o vídeo.

6. **Verificar**: abrir `/obras/$num` de algumas obras para confirmar que o player exibe o vídeo com a proporção correta, e revisar a galeria `/postagens`.

## Observações técnicas

- Os vídeos são privados: a página pública já usa `getVideoObra` (URL assinada de 1h) — nada muda na UI, só passa a existir vídeo para mais obras.
- O upload é feito direto na API de Storage (contornando limite de tamanho do repositório), exatamente como na importação anterior.
- Nenhuma mudança de schema é necessária (`largura`/`altura` já existem em `postagens_reels`).

Confirme que devo prosseguir; na primeira etapa eu volto com a tabela de mapeamento vídeo → número da obra para seu aval antes de qualquer upload.