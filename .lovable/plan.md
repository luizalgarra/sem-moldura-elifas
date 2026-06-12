## Objetivo

Adicionar à seção "Institucional" da página `/qrcodes` um segundo QR Code, apontando para a programação da Caixa Cultural:
`https://www.caixacultural.gov.br/Paginas/Programacao.aspx?idEvento=4588`

## Mudança

Em `src/routes/qrcodes.tsx`, na `<section>` "Institucional" já existente, transformar o card único em uma pequena grade com dois cards lado a lado:

1. **Instituto Elifas Andreato** (já existente) — `https://institutoelifasandreato.org.br`
2. **Caixa Cultural — Programação** (novo) — URL acima

```text
[ Institucional ]
  ┌──────────────┐   ┌──────────────┐
  │   QR Code    │   │   QR Code    │
  │  Instituto   │   │ Caixa Cult.  │
  └──────────────┘   └──────────────┘
```

Reutiliza o componente existente `QrCode`, mantendo o mesmo estilo dos cards (`rounded-lg border border-border bg-card p-4 text-center`). Nenhuma alteração de dados ou backend.

## Detalhe técnico

- Trocar o wrapper único por um container flex/grid (ex.: `flex flex-wrap gap-4`) contendo os dois cards.
- Novo card: `<QrCode valor="https://www.caixacultural.gov.br/Paginas/Programacao.aspx?idEvento=4588" tamanho={150} rotulo="QR Code da Caixa Cultural" />` com legenda "Caixa Cultural — Programação".
</plan_content>