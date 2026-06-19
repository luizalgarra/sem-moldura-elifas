# Checkbox "Aprovar" ao lado da locução gerada

Hoje existe um botão **Aprovar/Desaprovar** na barra de ações. O pedido é ter um **checkbox "Aprovar"** posicionado junto ao player de áudio da locução gerada.

## Mudança (`src/routes/admin.tsx`)

- No bloco `audioRegenSrc` (onde aparece "Locução gerada" + o `<audio>`), adicionar um **checkbox "Aprovar"** ao lado/abaixo do player.
  - Usa o componente `Checkbox` de `@/components/ui/checkbox`.
  - Estado `checked = aprovada` (derivado de `statusDaObra(override)`).
  - Ao marcar/desmarcar, chama o já existente `handleAprovar` (server function `definirAprovacao`), com indicador de carregamento (`disabled` enquanto `aprovando`).
  - Label associada via `htmlFor`/`id` para acessibilidade.
- **Remover o botão Aprovar/Desaprovar** da barra de ações da audiodescrição, já que o checkbox passa a ser o controle de aprovação (evita controle duplicado). O selo de status no topo do cartão permanece.

## Observações

- A lógica de backend (`definirAprovacao`), o status e o filtro continuam iguais — só muda o controle de UI de botão para checkbox e sua posição.
- O checkbox só aparece quando há locução gerada (`audioRegenSrc`), conforme o pedido ("ao lado dos áudios de locução gerados").
