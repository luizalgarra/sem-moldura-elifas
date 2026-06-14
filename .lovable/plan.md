# Ocultar menus de navegação na página /obras

Na página `/obras`, manter o cabeçalho (logo, controles de acessibilidade e botão Sair), mas remover os menus suspensos de navegação (Instituto, Elifas Andreato, Acervo, Espaços de Memória, Participe) — tanto no desktop quanto no menu mobile.

## Mudanças

1. **`src/components/SiteHeader.tsx`**
   - Adicionar uma prop opcional `ocultarNavegacao?: boolean`.
   - Quando `true`, não renderizar o `NavigationMenu` (desktop) nem o `Sheet`/botão de menu (mobile). Logo, acessibilidade e botão Sair permanecem.

2. **`src/routes/__root.tsx`**
   - No componente `Conteudo`, detectar quando a rota atual é `/obras` (`pathname === "/obras"`).
   - Passar `ocultarNavegacao={pathname === "/obras"}` para `<SiteHeader />`.

## Observações
- Nenhuma mudança em rotas, dados ou backend.
- O comportamento das demais páginas permanece inalterado.
