# Conteúdo das páginas "O Instituto"

Vou substituir os stubs vazios das cinco páginas da seção `/instituto` pelo conteúdo institucional fornecido, com tipografia consistente com o restante do site e metadados de SEO por rota.

## Abordagem

1. **Novo componente `src/components/PaginaArtigo.tsx`**
   - Layout de leitura reutilizável (título + parágrafos), seguindo o mesmo estilo de `PaginaStub` (container `max-w-3xl`, `font-serif` no H1, `text-muted-foreground` no corpo).
   - Aceita `titulo` e um array de parágrafos (`paragrafos: string[]`), renderizando cada um com espaçamento adequado.
   - As notas internas de validação (ex.: "[validar informação histórica]", "[verificar data...]") **não** serão exibidas ao público — serão removidas do texto final, pois são instruções de revisão, não conteúdo.

2. **Atualizar as 5 rotas** para usar `PaginaArtigo` com o texto correspondente e `head()` com SEO:
   - `src/routes/instituto.missao-e-legado.tsx` — Missão e Legado
   - `src/routes/instituto.pilares.tsx` — Pilares
   - `src/routes/instituto.governanca.tsx` — Governança
   - `src/routes/instituto.rede-de-parceiros.tsx` — Rede de Parceiros
   - `src/routes/instituto.transparencia.tsx` — Transparência

3. **SEO por rota** — em cada `head()`:
   - `title` específico (já existente, mantido/ajustado)
   - `meta description` fornecida pelo usuário
   - `og:title`, `og:description`, `og:url` (auto-referente, base `https://institutoelifasandreato.org.br`)
   - `link canonical` auto-referente na folha

## Observações

- As marcações entre colchetes do texto (datas/nomes a confirmar) serão **omitidas** da versão pública; se desejar, posso depois inserir os valores oficiais quando confirmados.
- Nenhuma alteração em navegação, dados, backend ou nas demais seções.
- A página índice `/instituto` permanece como está (lista de subseções).