# Gestão de impressão dos QR Codes

Criar uma página dedicada para selecionar quais obras imprimir e baixar um arquivo PDF pronto, com 6 QR Codes por folha A4 (2 colunas × 3 linhas), cada um com o QR Code e o título da obra.

## Comportamento

- Lista todas as obras em cartões selecionáveis (checkbox), com pré-visualização do QR Code e título.
- Ações de seleção: **Selecionar todas**, **Limpar seleção** e contador de selecionadas.
- Botão **Gerar PDF** que baixa diretamente um `.pdf` (sem caixa de impressão), com layout fixo de 6 por página.
- Cada card no PDF: QR Code + título da obra (sem rótulo "Obra N" e sem URL), centralizados.
- Botão desabilitado quando nenhuma obra está selecionada.

## Implementação técnica

1. **Dependência**: adicionar `jspdf` (`bun add jspdf`). A biblioteca `qrcode` já existe no projeto e gera data URLs via `QRCode.toDataURL`.

2. **Nova rota**: `src/routes/qrcodes.imprimir.tsx` → `/qrcodes/imprimir`.
   - `createFileRoute("/qrcodes/imprimir")` com `head()` próprio (title/description + `robots: noindex`).
   - Estado `selecionadas: Set<number>` para as obras marcadas.
   - Grade de cartões reutilizando o componente `QrCode` e os dados de `@/data/obras` + `SITE_URL` de `@/lib/site`.

3. **Geração do PDF** (função client-side no clique):
   - Para cada obra selecionada, gerar o data URL do QR Code com `QRCode.toDataURL(`${SITE_URL}/obras/${num}`, { margin: 1, color: { dark: "#2a1a12", light: "#ffffff" } })`.
   - Criar `new jsPDF({ format: "a4", unit: "mm" })`, calcular grade 2×3, posicionar imagem do QR e o título (com quebra/truncamento via `splitTextToSize`) abaixo de cada QR.
   - A cada 6 cards adicionar nova página (`doc.addPage()`).
   - `doc.save("qrcodes-obras.pdf")`.

4. **Link de navegação**: adicionar um botão/link na página `/qrcodes` apontando para `/qrcodes/imprimir` (e vice-versa), usando `<Link>` do `@tanstack/react-router`.

## Observações

- Toda a lógica é frontend; não há mudanças de backend, banco ou storage.
- Estilização com tokens semânticos do design system existente (`border`, `card`, `muted-foreground`, etc.).
