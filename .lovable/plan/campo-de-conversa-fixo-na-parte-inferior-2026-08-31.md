# Campo de conversa fixo na parte inferior

## Objetivo

Na tela limpa da conversa (`/rede-alem-da-moldura/conversa`), o campo "Escreva aqui…" fica fixo na parte inferior da tela, e as mensagens rolam para cima dentro de uma área própria — comportamento de chat, sem cabeçalho nem rodapé do site.

## Mudanças

### 1. Estrutura de altura da tela limpa

- Em `src/routes/rede-alem-da-moldura.conversa.tsx`, o container principal passa a ocupar a altura total da viewport (`h-dvh` ou `h-screen`) e usa `flex flex-col`.
- O link "Sair da conversa" permanece no topo, fora da área de rolagem.
- O componente `Conversa` recebe a altura restante da tela e também usa `flex flex-col`.

### 2. Área de mensagens scrollável

- Dentro de `src/components/rede/Conversa.tsx`, separar o layout em duas regiões:
  - **Região superior**: barra de progresso + lista de mensagens em um container `flex-1 overflow-y-auto`.
  - **Região inferior**: campo de texto e botões fixos na base.
- A barra de progresso pode ficar colada no topo da área de rolagem (sticky) ou logo acima da lista; a escolha será validada no preview.
- O scroll automático para a última mensagem (`fimRef`) continua funcionando, agora dentro do container scrollável.

### 3. Campo de texto fixo

- O `<form>` com o `<textarea>` "Escreva aqui…" fica em um container fixo na parte inferior, com fundo sólido (`bg-background`) para não deixar o texto das mensagens aparecer por trás.
- Adicionar uma borda sutil ou sombra superior para separar visualmente o input da lista de mensagens.
- Garantir que, ao crescer com Shift+Enter, o textarea aumente para cima sem sair da tela.

### 4. Estados especiais

- **Erro**: aparece acima do campo fixo, dentro da área inferior ou logo abaixo da última mensagem.
- **Proposta de ficha ("Está certo assim" / "Quero mudar algo")**: aparece dentro da área de mensagens, acima do campo fixo.
- **Aprovação final**: mensagem de confirmação também fica na área de mensagens.
- **Tela de carregamento / erro de sessão**: mantém o layout centralizado atual, pois ainda não há conversa.

### 5. Ajustes mobile

- Usar `h-dvh` para respeitar a barra de endereços móvel.
- Garantir que o teclado virtual não quebre o layout: o campo continua visível e a área de mensagens reduz de altura.
- Padding inferior considerável (`pb-safe` ou `pb-6`) para áreas com gesture bar.

## Detalhes técnicos

- Arquivos alterados:
  - `src/components/rede/Conversa.tsx` — reestruturação do layout em área scrollável + input fixo.
  - `src/routes/rede-alem-da-moldura.conversa.tsx` — altura total da viewport e colocação do link "Sair da conversa".
- Sem mudanças no servidor, no banco de dados ou na lógica de mensagens.
- O scroll automático para a última resposta continua ativo.

## Verificação

- Abrir `/rede-alem-da-moldura/conversa` no preview.
- Confirmar que o campo "Escreva aqui…" está grudado na parte inferior da tela.
- Enviar várias mensagens e verificar que a conversa sobe, mantendo a última resposta visível.
- Testar refresh para garantir que a reconstrução do estado ainda funciona.
- Testar em altura de viewport pequena (mobile) para confirmar que o campo não some.
