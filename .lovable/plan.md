# Página "Linhas da Vida" — Timeline de Elifas Andreato

## Objetivo
Criar uma nova página com a biografia em linha do tempo (1946–2022) e adicioná-la à navegação do site.

## O que será feito

### 1. Nova rota `src/routes/linhas-da-vida.tsx`
- `createFileRoute("/linhas-da-vida")` com `head()` próprio (title, description, og:title, og:description).
- Título H1 "Linhas da Vida" + subtítulo curto sobre a trajetória do artista.
- Linha do tempo vertical com todos os marcos fornecidos (1946 a 2022), incluindo os eventos adicionais (1982, 2018, 2020).
- Cada item: **ano em destaque** (cor de acento) + texto descritivo, com uma linha/traço lateral conectando os pontos (estilo timeline), usando os tokens do design system (border, accent, muted-foreground, card).
- Layout responsivo (legível no celular), seguindo o padrão visual das outras páginas (`mx-auto max-w-3xl px-4 py-10`, `font-serif` nos títulos).

### 2. Menu do cabeçalho — `src/components/SiteHeader.tsx`
- Adicionar item `Linhas da Vida` na `<nav>` principal, ao lado de "Acervo" e "Como usar", com `activeProps`.

### 3. Rodapé — `src/components/SiteFooter.tsx`
- Adicionar link `Linhas da Vida` na lista de navegação do rodapé.

## Detalhes técnicos
- Os textos da timeline ficam num array tipado dentro do arquivo da rota (sem backend).
- Os anos marcados como "Evento Adicional" entram na ordem cronológica como entradas normais (rótulo "1982", "2018", "2020"), sem o sufixo entre parênteses.
- Sem alterações de backend, dados ou lógica — apenas frontend/apresentação.
- O `routeTree.gen.ts` é gerado automaticamente; não será editado à mão.

## Texto da linha do tempo
Serão incluídos integralmente os marcos enviados: 1946, 1958, 1960, 1965, 1967, 1969, 1972, 1973, 1974, 1975, 1979, 1980, 1981, 1982, 1983, 1984, 1986, 1987, 1988, 1991, 1996, 1997, 1998, 1999, 2008, 2011, 2012, 2013, 2015, 2017, 2018, 2019, 2020, 2022.
