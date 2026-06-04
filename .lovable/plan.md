## Objetivo

Na página `/qrcodes`, remover de cada card o rótulo "OBRA N" e o texto do endereço web, mantendo o QR Code e o título da obra.

## Mudança

Em `src/routes/qrcodes.tsx`, dentro do `.map`, remover:

- O parágrafo `<p>...Obra {obra.num}...</p>` (rótulo "OBRA 1" em vermelho)
- O parágrafo `<p>...{url}...</p>` (a URL `https://.../obras/1`)

O QR Code continua usando a `url` internamente (gera o link), apenas o texto deixa de aparecer. O título da obra (`Secos e Molhados, Opinião`) permanece.

## Resultado

Cada card mostrará apenas: QR Code + título da obra.