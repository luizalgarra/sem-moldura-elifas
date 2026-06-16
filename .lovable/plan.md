## Objetivo
Mudar o PDF de QR Codes de 6 para 8 imagens por página.

## Alteração
Em `src/routes/qrcodes.imprimir.tsx`, na função `gerarPdf`:

- Trocar `const rows = 3;` por `const rows = 4;` (mantendo `cols = 2`), resultando em 2×4 = 8 por página.
- Reduzir o tamanho do QR (`qrSize`) de 55mm para ~42mm e ajustar o espaçamento vertical (`qrY` e a posição do texto) para que os 4 itens por coluna caibam sem sobreposição na folha A4.

Também atualizar o texto da página (cabeçalho) que menciona "6 QR Codes por folha A4" para "8 QR Codes por folha A4".

## Verificação
Gerar um PDF de teste e conferir visualmente que cada página mostra 8 códigos com títulos legíveis e sem cortes/sobreposição.

Nenhuma outra lógica (seleção, dados, links) será alterada.