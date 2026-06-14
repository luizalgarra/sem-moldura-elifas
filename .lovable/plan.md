# Projetos e Iniciativas — Linha do Tempo de Realizações

## Objetivo
Publicar a relação histórica de projetos e iniciativas do Instituto/Elifas Andreato (1970 a 2026) numa nova página dentro da seção **O Instituto**.

## Onde inserir
Nova rota: `/instituto/projetos-e-iniciativas`, seguindo o mesmo padrão das demais páginas do Instituto (head/SEO, layout central). Será adicionada ao menu suspenso "O Instituto" e ao índice de seções em `instituto.index.tsx`.

Título de menu sugerido: **Projetos e Iniciativas**.

## Conteúdo e formato
Os dados serão exibidos em ordem cronológica decrescente (2026 → 1970), usando o componente de tabela já existente (`src/components/ui/table.tsx`). Colunas:

```text
Ano | Projeto/Iniciativa | Categoria | Descrição | Público-Alvo | Colaboradores | Status/Resultado
```

A coluna "Fonte" (números 1–5) será convertida em uma **legenda de fontes** no rodapé da página, em vez de uma coluna numérica solta, para ficar legível e profissional.

### Registros (16 linhas)
- 2026 (Planejado) — Plano Anual de Atividades (PRONAC 256514)
- 2026 (Planejado) — Livro 'Lembramentos' e Web série
- 2025 (Planejado) — Calçadão do Reconhecimento
- 2024 — Espaço Cultural a Céu Aberto Elifas Andreato
- 2022 — Oficinas Formativas
- 2020 — Aplicativo Almanaque Brasil
- 2019 — Capas do Brasil
- 2018 — Sarau do Elifas
- 2018 — A Arte Negra de Elifas Andreato
- 2011 — Mobilização Praça Memorial Vladimir Herzog
- 1999–2017 — Almanaque Brasil
- 1982 — Volta de Dulcina
- 1981 — Clara Mestiça
- 1970–1980 — Imprensa Alternativa (Opinião, Argumento, Movimento)
- Não especificado — Cursos Digitais e Área do Aluno

(Todo o conteúdo textual fornecido será preservado integralmente.)

### Status
A coluna Status/Resultado usará badges sutis (Concluído, Em construção, Planejado, Inaugurado, Em operação, Aprovado/Captação) com o componente `Badge` existente.

## Responsividade
Em telas pequenas, a tabela rola horizontalmente (o wrapper de `Table` já tem `overflow-auto`). As descrições longas terão largura mínima de coluna controlada para manter a leitura.

## Detalhes técnicos
- Criar `src/routes/instituto.projetos-e-iniciativas.tsx` com `createFileRoute("/instituto/projetos-e-iniciativas")`, `head()` com title/description/og/canonical próprios.
- Dados em um array tipado dentro do próprio arquivo (ou em `src/data/`), renderizados na tabela.
- Adicionar o item em `src/data/navegacao.ts` no grupo "O Instituto".
- A rota será registrada automaticamente pelo plugin do TanStack (não editar manualmente o routeTree).

Publicação direta, sem marcações de revisão, conforme o critério já adotado.
