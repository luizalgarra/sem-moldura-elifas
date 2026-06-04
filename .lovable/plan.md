## Objetivo

Garantir que os QR Codes impressos de cada obra apontem **sempre** para a página publicada da obra (com áudio-descrição), independente de onde a página `/qrcodes` for aberta.

## Situação atual

- A página `/qrcodes` gera os QR Codes com `window.location.origin`, ou seja, eles apontam para o endereço onde a página está aberta (preview, sandbox ou publicado). Isso é arriscado para impressão: um QR gerado no preview levaria a um link temporário.
- Cada QR já leva para `/obras/{num}`, que é a página da obra com player de áudio-descrição. Esse destino está correto.

## Mudança

Fixar a URL base de produção para os QR Codes impressos.

1. Definir uma constante de URL pública do site: `https://sem-moldura-elifas.lovable.app`.
2. Na página `/qrcodes`, usar essa base fixa para montar `https://sem-moldura-elifas.lovable.app/obras/{num}` em vez de `window.location.origin`.
3. Mostrar abaixo de cada QR a URL final em texto (apoio/conferência na impressão).
4. Manter o destino em `/obras/{num}` (página com áudio-descrição) — sem alteração de rota.

## Detalhes técnicos

- Criar `SITE_URL = "https://sem-moldura-elifas.lovable.app"` (constante simples, podendo ficar em `src/data/obras.ts` ou um pequeno `src/lib/site.ts`).
- Editar `src/routes/qrcodes.tsx`: remover a dependência de `window.location.origin` para a geração dos QRs e usar `SITE_URL`. O `useEffect`/`useState` de origem deixa de ser necessário.
- Nenhuma mudança em `QrCode.tsx`, nas obras ou na página da obra.

## Fora de escopo

- Domínio personalizado (caso adote um domínio próprio no futuro, basta atualizar a constante `SITE_URL`).
- Mudanças no conteúdo/áudio-descrição das obras.