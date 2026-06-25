## Objetivo
Reformular a diagramação da home (`src/routes/index.tsx`) seguindo a direção escolhida "Grid modernista sóbrio", melhorando hierarquia, ritmo vertical e equilíbrio entre os elementos — mantendo o conteúdo e os dados reais do projeto.

## Mudanças (somente `src/routes/index.tsx`)

### 1. Hero em duas colunas (12-col grid)
- Coluna esquerda (7/12): chips "Catálogo Virtual" e "Exposição Acessível", título `Elifas Andreato / Além da Moldura`, subtítulo real (117 obras com áudio-descrição) e um botão CTA "Explorar obras" → `/obras`.
- Coluna direita (5/12): o retrato/arte (`marca.heroElifasArte`) num cartão `aspect-[4/5]` com moldura, gradiente e detalhe decorativo em âmbar.
- Elimina o grande vazio vertical/horizontal atual ancorando a imagem ao lado do texto, em vez de fundo esmaecido.

### 2. Banner "Linha do Tempo"
- Mantém o `Link to="/linhas-da-vida"`, com padding maior, título 4xl, descrição e indicador "Ver cronologia" com seta/linha em âmbar no hover.

### 3. Grid "Algumas obras"
- Cabeçalho com título + subtítulo e rótulo "Galeria digital", com borda inferior separadora.
- Mantém os 6 destaques reais (`obras.filter(o => o.imagem).slice(0,6)`) com `Link to="/obras/$num"`, imagem real, título e ano reais.
- Botão final centralizado "Ver todas as 117 obras" → `/obras` (substitui/realça o link "Ver todas").

## Regras técnicas
- **Sem cores hardcoded**: o protótipo usa `#EA9E0E`, `bg-[#0a0a0a]`, `text-zinc-*`. Na implementação uso os tokens semânticos já existentes (`bg-background`, `text-foreground`, `text-accent`, `border-border`, `text-muted-foreground`, `bg-card`) para preservar tema escuro, alto contraste e dark mode.
- **Acessibilidade**: foco visível (já global), `alt` descritivo nas imagens, um único `<h1>`, ícone decorativo com `aria-hidden`.
- Mantém imports reais (`obras`, `marca`, `Link`, ícones lucide) e o componente `EmConstrucao` intacto.
- Sem mudanças de dados, rotas ou lógica de backend — apenas apresentação.

## Verificação
- Build/typecheck automático e screenshot via Playwright da home para conferir o equilíbrio do hero, banner e grid.
