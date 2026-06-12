## Objetivo

Adicionar à página `/qrcodes` um QR Code institucional que aponta para `https://institutoelifasandreato.org.br`, separado da grade de QR Codes das obras.

## Mudança

Em `src/routes/qrcodes.tsx`, incluir um bloco destacado (acima ou abaixo da grade de obras) com:

- Um `<QrCode valor="https://institutoelifasandreato.org.br" tamanho={150} rotulo="..." />`
- Um rótulo curto, ex.: "Instituto Elifas Andreato"

```text
[ Cabeçalho QR Codes das obras ]

[ Card destacado ]
  ┌──────────────┐
  │   QR Code    │
  │  Instituto   │
  └──────────────┘

[ Grade de QR Codes das obras ]
```

Reutiliza o componente existente `QrCode`. Nenhuma alteração de dados ou backend.

## Detalhe técnico

- Card seguindo o mesmo estilo dos cards existentes (`rounded-lg border border-border bg-card p-4 text-center`).
- O QR Code aponta para a URL externa fixa, não para uma obra.