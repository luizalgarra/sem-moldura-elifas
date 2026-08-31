# Conversa da Rede em tela limpa e dedicada

## Objetivo

Ao começar a conversa com o Anfitrião, a pessoa sai da página de apresentação e vai para uma tela própria, limpa — sem cabeçalho nem rodapé do site — contendo apenas a conversa. A última resposta fica sempre visível (rolagem automática, como já ocorre hoje).

## Decisões (conforme respostas)

- **Rota separada**: a conversa vive em `/rede-alem-da-moldura/conversa`.
- **Retomada automática**: se houver sessão salva no navegador, a conversa abre direto na tela limpa.
- **Link mínimo para voltar**: um link discreto "Sair da conversa" no topo da tela limpa.

## Mudanças

### 1. Estrutura de rotas

- `src/routes/rede-alem-da-moldura.tsx` vira rota de layout: componente passa a renderizar apenas `<Outlet />`; todo o conteúdo atual (apresentação + formulário) migra para `src/routes/rede-alem-da-moldura.index.tsx`, com o `head()` atual preservado.
- Nova rota `src/routes/rede-alem-da-moldura.conversa.tsx` (`/rede-alem-da-moldura/conversa`): tela limpa com `robots: noindex`, sem navegação do site.

### 2. Tela limpa sem chrome do site

- Em `src/routes/__root.tsx` (`Conteudo`), o `SiteHeader` e o `SiteFooter` deixam de renderizar em `/rede-alem-da-moldura/conversa` e em `/continuar` (que é só uma ponte de retomada).
- A tela da conversa mostra apenas: link discreto "Sair da conversa" (volta para `/rede-alem-da-moldura`, limpando a sessão local), a barra de progresso fina, as mensagens e o campo de escrita — componente `Conversa` existente, sem alteração de comportamento.

### 3. Fluxo de entrada

- No formulário (`rede-alem-da-moldura.index.tsx`), após `abrir` a conversa: guarda sessão e estado inicial no `sessionStorage` e navega para `/rede-alem-da-moldura/conversa` (em vez de trocar o componente na mesma página).
- A rota de conversa monta o estado a partir do `sessionStorage`.

### 4. Sobreviver a refresh e retomada automática

- Nova ação `estado` em `src/lib/rede-anfitriao.server.ts` (`rede-conversa`): dado `conversa_id` + `sessao`, devolve histórico de mensagens, `faltam` e `ferramentas`. Hoje isso não existe — por isso um refresh perderia a conversa.
- Na rota de conversa: se houver sessão salva mas nenhum estado em memória (ex.: refresh), carrega via ação `estado`. Se a sessão estiver inválida/expirada, limpa e redireciona para `/rede-alem-da-moldura`.
- Na página da Rede (`index`): ao montar, se houver sessão válida salva, redireciona automaticamente para `/rede-alem-da-moldura/conversa`.
- `/continuar?t=...` (componente `Retomar`): após retomar com sucesso, guarda a sessão e navega para a tela limpa.

### 5. Verificação

- Fluxo ponta a ponta no preview: inscrição → tela limpa sem cabeçalho/rodapé → troca de mensagens → refresh mantém a conversa → voltar à página da Rede reabre direto na conversa → "Sair da conversa" limpa e volta → link `/continuar?t=...` abre na tela limpa.

## Detalhes técnicos

- Rota-filho exige `createFileRoute("/rede-alem-da-moldura/conversa")` no arquivo `rede-alem-da-moldura.conversa.tsx`; o layout pai deve renderizar `<Outlet />`.
- Nenhuma mudança de banco de dados; a ação `estado` apenas lê as tabelas `rede` existentes.
- Sem alteração visual no componente `Conversa` além do acréscimo do link "Sair da conversa".
