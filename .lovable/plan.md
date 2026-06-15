## Objetivo

Ajustar a página do acervo (`src/routes/obras.index.tsx`).

## Mudanças

**1. Destaque para "Linhas da Vida" no topo**
- Inserir, abaixo do título/descrição e acima do campo de busca, um card em destaque com `<Link to="/linhas-da-vida">`.
- Estilo com tokens do design (`bg-card`, `border-accent`, `text-accent`), ícone, título "Linhas da Vida", frase curta convidando a percorrer a trajetória de Elifas Andreato e seta de ação.

**2. Remover a caixa "Paredes"**
- Excluir o bloco `<nav aria-label="Saltar para parede">…</nav>`.
- Mantêm-se os títulos e `id="parede-…"` na listagem; apenas o menu de atalhos sai.

Nenhuma outra lógica (busca, agrupamento, dados) será alterada.
