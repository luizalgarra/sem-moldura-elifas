## Objetivo

Aprimorar a página pública **/obras** (Catálogo Virtual) adicionando uma alternância entre **grade** (cards, como hoje) e **lista** (linhas compactas), sem login. A busca, os filtros (tipo/função/período) e a navegação anterior/próxima dentro de cada obra continuam funcionando.

## O que será feito

### 1. Alternância grade/lista em `src/routes/obras.index.tsx`
- Adicionar um controle (dois botões com ícones `LayoutGrid` / `List` do lucide-react) no cabeçalho, ao lado da contagem de obras.
- Persistir a escolha na URL via o `searchSchema` existente, novo parâmetro `vista: "grade" | "lista"` (padrão `"grade"`), seguindo o mesmo padrão dos filtros atuais (TanStack Router + zod). Assim o estado é compartilhável e sobrevive a refresh.
- Quando `vista === "grade"`: renderiza o grid atual com `ObraCard` (sem mudanças).
- Quando `vista === "lista"`: renderiza cada obra como uma linha compacta — miniatura pequena, número da obra, título, ano e técnica — agrupadas pelas mesmas paredes/seções já existentes.

### 2. Novo componente `src/components/ObraLinha.tsx`
- Item de lista enxuto (Link para `/obras/$num`), com miniatura (`obra.imagem` ou ícone `ImageOff`), número, título, ano e técnica.
- Reusa os tokens de design já em uso (border, card, accent, brand-yellow), sem cores hardcoded.

### 3. Navegação anterior/próxima
- Já existe via `NavegacaoSequencial` em `/obras/$num`. Nenhuma mudança necessária — apenas confirmar que continua público.

## Detalhes técnicos
- `vista` entra no `searchSchema` com `fallback(...).default("grade")`; não entra em `loaderDeps` (não afeta o carregamento de dados, é só apresentação).
- Toggle atualiza a URL via `navigate({ to: "/obras", search: (prev) => ({ ...prev, vista }) })`, igual aos filtros atuais.
- Agrupamento por parede (`agruparPorParede`) é reaproveitado para ambas as visualizações.
- Acessibilidade: o toggle usa `aria-pressed` e rótulos claros ("Ver em grade" / "Ver em lista").

## Fora de escopo
- Nenhuma mudança de backend, dados ou autenticação. O site permanece totalmente público.
