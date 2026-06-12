# Nova página "Sobre a Exposição"

## Objetivo
Criar uma página dedicada com o texto de apresentação institucional da CAIXA Cultural, seguindo o padrão visual do site, e adicioná-la à navegação.

## O que será feito

### 1. Nova rota `src/routes/sobre.tsx`
- `createFileRoute("/sobre")` com `head()` próprio (title, description, og:title, og:description).
- Título H1 "Sobre a Exposição" + os quatro parágrafos do texto institucional integralmente.
- Layout no padrão das outras páginas (`mx-auto max-w-3xl px-4 py-10`, `font-serif` nos títulos, `text-muted-foreground` no corpo, `leading-relaxed`).
- Primeiro parágrafo em leve destaque editorial (texto um pouco maior / `text-foreground`) para abrir a leitura, mantendo os tokens do design system.

### 2. Menu do cabeçalho — `src/components/SiteHeader.tsx`
- Adicionar item `Sobre` na `<nav>` principal, com `activeProps`.

### 3. Rodapé — `src/components/SiteFooter.tsx`
- Adicionar link `Sobre a exposição` na lista de navegação do rodapé.

## Texto a incluir
Os quatro parágrafos enviados (apresentação da exposição, atuação de Elifas na música, sua trajetória de 50 anos, e o compromisso da CAIXA com a cultura), preservando o conteúdo na íntegra.

## Detalhes técnicos
- Sem backend, dados ou lógica — apenas frontend/apresentação.
- `routeTree.gen.ts` é gerado automaticamente; não será editado à mão.
