# Caixa de mensagem realmente presa na base

## Problema

Hoje a tela da conversa depende de uma cadeia de alturas (`min-h-screen` no layout raiz → `main flex-1` → `h-dvh` na rota → coluna flex no componente). Basta um elo dessa cadeia crescer para a página inteira ganhar rolagem e o campo "Escreva aqui…" descer junto com a conversa, em vez de ficar colado na base.

## Solução

Tirar a tela da conversa dessa dependência: ela passa a ser uma camada própria, ancorada na viewport.

### 1. Tela da conversa como camada fixa

- Em `src/routes/rede-alem-da-moldura.conversa.tsx`, o container vira uma camada `fixed inset-0` (altura da viewport garantida, sem herdar nada do layout do site), em coluna: topo com "Sair da conversa", meio com as mensagens, base com o campo.
- Bloquear a rolagem do documento enquanto essa tela está montada (trava em `body`/`html`, liberada ao sair), para não existir uma segunda barra de rolagem por trás.

### 2. Áreas internas com limite de altura

- Em `src/components/rede/Conversa.tsx`, garantir `min-h-0` na área de mensagens para que ela encolha em vez de empurrar o campo para fora da tela.
- Barra de progresso e bloco do campo continuam `shrink-0`.
- Limitar o crescimento do textarea (máximo já existente de 240px), com a área de mensagens cedendo altura.

### 3. Base segura no celular

- Usar `100dvh` na camada e padding inferior com `env(safe-area-inset-bottom)`, para o campo não ficar sob a barra de gestos.
- Ao focar o campo com o teclado virtual aberto, a área de mensagens reduz e a última resposta continua visível.

### 4. Nada tapando o campo

- O aviso flutuante de instalação do app (`DicaInstalacao`) é fixo na parte inferior da tela e pode cobrir o campo. Ele deixa de aparecer na tela da conversa.

## Detalhes técnicos

- Arquivos: `src/routes/rede-alem-da-moldura.conversa.tsx`, `src/components/rede/Conversa.tsx` e um ajuste de condição em `src/routes/__root.tsx` (esconder `DicaInstalacao` na tela limpa).
- Sem mudanças no servidor, no banco ou na lógica das mensagens.
- A rolagem automática para a última resposta continua acontecendo dentro da área de mensagens.

## Verificação

- Abrir `/rede-alem-da-moldura/conversa` e medir no preview: a base do campo coincide com a base da viewport, e o documento não rola.
- Enviar mensagens até passar da altura da tela: a conversa sobe, o campo não se move.
- Repetir em viewport de celular (390×844).
