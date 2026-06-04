## Objetivo

1. Renomear a parede "Obras adicionais" para **"Parede 4"** em todos os lugares.
2. Criar uma nova seção **"Vídeos"** no acervo (mais um grupo, igual às paredes).
3. Mover para "Vídeos" as 13 obras audiovisuais (posições exibidas 103 a 115 — os trabalhos "Video 1" a "Video 13", técnica Audiovisual).

## O que muda na prática

- Na página do acervo (`/obras`), o grupo "Obras adicionais" passa a se chamar **"Parede 4"**.
- Surge um novo grupo **"Vídeos"**, exibido logo após "Parede 4", contendo as 13 obras de vídeo.
- As 5 obras "Shape" (que estavam em "Obras adicionais") permanecem em "Parede 4".
- A obra "Gabriela" (posição 116) continua em "Parede 4" (não é vídeo).

## Detalhes técnicos

### 1. Dados das obras fixas (`src/data/obras.ts`)
- Substituir todas as ocorrências de `parede: "Obras adicionais"` por `parede: "Parede 4"`.
- Nas 13 obras de vídeo (entradas internas `num` 102 a 114, títulos "Video1, Almanaque" … "Video 13, Traço de União", técnica "Audiovisual"), definir `parede: "Vídeos"`.
- Atualizar o array `paredesOrdem`: trocar `"Obras adicionais"` por `"Parede 4"` e acrescentar `"Vídeos"` logo em seguida, para garantir a ordem Parede 1 → 2 → 3 → 4 → Vídeos.

### 2. Defaults no código
- `src/lib/admin-obras.functions.ts` (linha ~106): default de `parede` das obras extras de `"Obras adicionais"` para `"Parede 4"`.
- `src/routes/editar.tsx` (estado inicial e reset do formulário): valor padrão de `"Obras adicionais"` para `"Parede 4"`.

### 3. Dados existentes no banco
- As 5 obras "Shape" em `obras_extras` (registros 1001–1005) têm `parede = "Obras adicionais"`; atualizar para `"Parede 4"`.
- Não há registros de parede em `obra_overrides`, então nada a ajustar lá.

## Observação importante sobre reprodução

As 13 obras audiovisuais hoje possuem apenas imagem e áudio no sistema (não há arquivo de vídeo associado). Esta tarefa apenas as reagrupa na seção "Vídeos"; a página de cada obra continuará exibindo imagem + áudio como hoje. Se você quiser reprodução de vídeo de fato (player com o arquivo .mp4 ou link), me envie os arquivos/links e eu adapto a página da obra e o modelo de dados em um passo seguinte.
