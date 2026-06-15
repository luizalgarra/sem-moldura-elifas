## Objetivo
Vídeos (técnica "Audiovisual" / parede "Vídeos", obras 104–116) não devem ter QR Code em nenhum lugar do site.

## Diagnóstico
QR Codes de obras só são gerados em duas páginas:
- `src/routes/qrcodes.index.tsx` (grade de QR Codes)
- `src/routes/qrcodes.imprimir.tsx` (seleção + geração de PDF)

As demais referências (`index.tsx`, `como-usar.tsx`, `SiteFooter.tsx`) usam apenas o ícone de QR, não geram código para vídeos.

## Critério de filtro
Considerar vídeo quando `parede === "Vídeos"` (equivalente à técnica "Audiovisual"). Esses itens serão excluídos das duas páginas.

## Alterações
1. **`src/routes/qrcodes.index.tsx`**: filtrar a lista de obras na grade, removendo as de parede "Vídeos" (ex.: `const obrasComQr = obras.filter((o) => o.parede !== "Vídeos")`), e usar essa lista no `.map`.

2. **`src/routes/qrcodes.imprimir.tsx`**:
   - Usar a mesma lista filtrada para o estado inicial de seleção, contagem "X de Y", botão "Selecionar todas", grade de checkboxes e geração do PDF.
   - Garantir que o PDF nunca inclua vídeos.

## Verificação
- Conferir que vídeos (104–116) não aparecem em `/qrcodes` nem em `/qrcodes/imprimir`.
- Gerar um PDF de teste e confirmar ausência de vídeos.

Nenhuma alteração nos dados (`obras.ts`) nem na página de acervo.