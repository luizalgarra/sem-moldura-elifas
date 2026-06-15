## Problema

A constante `SITE_URL` em `src/lib/site.ts` está definida como:

```text
https://www.institutoelifasandreato.org.br/alemdamoldura
```

Mas o aplicativo é servido na **raiz** do domínio (não há base path `/alemdamoldura`). Por isso:

- `https://institutoelifasandreato.org.br/obras/3` → funciona ✅
- `https://institutoelifasandreato.org.br/alemdamoldura/obras/3` → retorna 404 ❌

Como os QR Codes são gerados com `${SITE_URL}/obras/${num}`, todos os QR Codes impressos apontam para um endereço inexistente (404).

## Correção

Atualizar `src/lib/site.ts` removendo o trecho `/alemdamoldura`:

```text
export const SITE_URL = "https://institutoelifasandreato.org.br";
```

Isso faz os QR Codes passarem a apontar para `https://institutoelifasandreato.org.br/obras/3`, que é a página real da obra.

## Detalhes técnicos

- Arquivo alterado: `src/lib/site.ts` (apenas a constante).
- Usos afetados (sem mudança de código necessária): `src/routes/qrcodes.index.tsx` e `src/routes/qrcodes.imprimir.tsx`, que montam a URL via `${SITE_URL}/obras/${obra.num}`.
- Decisão de domínio: usar `institutoelifasandreato.org.br` (sem `www`), que é o domínio canônico testado e respondeu corretamente. Se preferir manter `www.`, ambos funcionam — basta indicar.

## Observação

Após a correção, será necessário **republicar** o site e **regerar/reimprimir** os QR Codes para que os novos códigos apontem para o endereço correto. Os QR Codes já impressos com o endereço antigo continuarão levando ao 404.