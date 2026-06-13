# Página "Em construção" na home

## Objetivo
Esconder o site da maioria dos visitantes: ao abrir a página inicial (`/`), em vez do conteúdo atual, mostrar uma tela "Em construção" com a logo da exposição e uma mensagem curta. As demais páginas (`/obras`, `/linhas-da-vida`, `/sobre` etc.) continuam funcionando por link direto, conforme escolhido.

## O que muda
- **`src/routes/index.tsx`**: o conteúdo atual da home (hero, destaques, cards) é substituído pela tela "Em construção". O código original é preservado comentado/guardado no mesmo arquivo, para eu reativar facilmente quando você avisar no chat.

A tela mostrará:
- A logo "Elifas Andreato — Além da Moldura" (`marca.logoFirmaBranco`), centralizada.
- A barra "Caixa Cultural apresenta" (mantendo a identidade), opcional e discreta.
- Título curto: **"Em breve"**.
- Mensagem curta: ex. *"Estamos preparando o catálogo virtual da exposição. Volte em breve."*
- Fundo na identidade do site (cores semânticas do tema, sem cores fixas), centralizado vertical e horizontalmente, responsivo e acessível (contraste adequado, um único H1).

## Detalhes técnicos
- Mantém `createFileRoute("/")` e a estrutura de rota intacta (sem mexer em `routeTree.gen.ts` nem no `__root.tsx`).
- Atualiza o `head()` da home com title/description neutros ("Em breve — Elifas Andreato"), para que quem compartilhar o link da home não exponha o catálogo ainda.
- Sem mudanças em dados, backend ou outras rotas.
- Reversão: quando você pedir, restauro o componente `Index` original (guardado no arquivo) e o `head()` anterior.

## Fora de escopo
- Bloqueio das outras páginas (você escolheu manter só a home escondida).
- Senha/acesso secreto (você reativará avisando no chat).
- Data de estreia e contato/redes (não solicitados).