## Objetivo

Remover a contagem de itens exibida nos chips do menu de paredes (ex.: "Parede 1 10", "Vídeos 13") na página do acervo (`/obras`).

## Mudança

- Em `src/routes/obras.index.tsx`, no bloco de navegação "Paredes" (lista de chips/atalhos), remover o `<span>` que mostra `grupo.obras.length` ao lado do nome de cada parede.
- Cada chip passa a exibir apenas o nome da parede, sem o número.

## Observação

O título de cada seção (cabeçalho `<h2>`) continuará mostrando o nome da parede. Caso você também queira remover a contagem que aparece entre parênteses nos títulos das seções, me avise — por ora a alteração foca apenas no menu de atalhos, como solicitado.
