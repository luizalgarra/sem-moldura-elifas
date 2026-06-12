## Objetivo

Atualizar o domínio usado para gerar os QR Codes das obras, refletindo a mudança para o novo endereço do projeto:

`https://www.institutoelifasandreato.org.br/alemdamoldura`

## Mudança

Em `src/lib/site.ts`, alterar a constante `SITE_URL`:

```ts
// antes
export const SITE_URL = "https://sem-moldura-elifas.lovable.app";
// depois
export const SITE_URL = "https://www.institutoelifasandreato.org.br/alemdamoldura";
```

Com isso, todos os QR Codes das obras passam a apontar para:

```text
https://www.institutoelifasandreato.org.br/alemdamoldura/obras/{num}
```

Isso afeta automaticamente:
- `src/routes/qrcodes.tsx` (grade de QR Codes das obras)
- `src/routes/qrcodes.imprimir.tsx` (versão para impressão/PDF)

## Mantido sem alteração

- Os dois QR Codes institucionais já existentes permanecem iguais:
  - **Instituto Elifas Andreato** — `https://institutoelifasandreato.org.br`
  - **Caixa Cultural — Programação** — URL atual
- Nenhuma alteração de dados, backend ou metadados.

## Observação

A constante `SITE_URL` é o único ponto que precisa mudar — os QR Codes das obras são derivados dela.