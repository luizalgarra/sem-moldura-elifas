# Esconder navegação na página "Em construção"

## Problema
O menu superior (`SiteHeader`) e o rodapé (`SiteFooter`) são renderizados no layout raiz (`src/routes/__root.tsx`), então aparecem em **todas** as rotas — inclusive na home "Em construção". Ambos contêm links para outras páginas (Acervo, Linhas da Vida, Sobre, Como usar, QR Codes), que devem desaparecer enquanto o site estiver escondido.

## O que muda
- **`src/routes/__root.tsx`**: no `RootComponent`, detectar a rota atual e, quando for a home (`/`), **não renderizar** `SiteHeader` nem `SiteFooter`. Nas demais rotas, tudo continua igual.

Resultado: a tela "Em construção" fica limpa, só com a logo e a mensagem, sem topo, sem rodapé e sem nenhum link para outras páginas.

## Detalhes técnicos
- Usar o estado do roteador (ex.: `useRouterState` para ler o `location.pathname`) dentro de `RootComponent`.
- Renderizar `SiteHeader`/`SiteFooter` condicionalmente: ocultos quando `pathname === "/"`.
- O `<main>` com `<Outlet />` permanece intacto (necessário para as rotas filhas).
- Sem mudanças em dados, backend, outras rotas ou nos próprios componentes de header/footer.

## Reversão
Quando o site voltar ao ar (junto com a restauração da home original), basta remover a condição e voltar a renderizar header e footer sempre.

## Fora de escopo
- Conteúdo da tela "Em construção" (já existe).
- Bloqueio das outras páginas (continuam acessíveis por link direto, conforme escolhido).
