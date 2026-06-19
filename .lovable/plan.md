## Problema

A locução continua saindo da descrição porque:

1. **A migração copiou `descricao` → `audiodescricao`**, então os dois campos ainda são idênticos em todas as obras existentes até serem editados separadamente.
2. **O botão "Gerar locução" lê o texto gravado no banco**, não o conteúdo atual da caixa "Texto da audiodescrição (locução)". Se o admin editar a caixa e clicar em "Gerar locução" sem salvar antes, a locução usa o valor antigo (a descrição copiada).
3. **A função `regenerarAudio` tem fallback para `descricao`**, mascarando casos em que a audiodescrição não foi definida e fazendo a locução cair na descrição silenciosamente.

## Objetivo

A locução deve ser gerada **estritamente a partir do Texto da audiodescrição (locução)** atual, nunca da descrição de referência.

## Mudanças

### 1. Backend — `src/lib/admin-obras.functions.ts`

- **`regenerarAudio`**: aceitar um parâmetro opcional `audiodescricao` (texto) no `inputValidator`. Quando enviado:
  - Salvar esse texto na coluna `audiodescricao` (upsert) **antes** de gerar o áudio, garantindo que banco e locução fiquem sincronizados.
  - Usar exatamente esse texto como fonte da locução.
- Quando o parâmetro **não** for enviado (ex.: geração em lote "todas as obras"), ler `audiodescricao` do banco.
- **Remover o fallback para a descrição do override** (`existente?.descricao`). A fonte passa a ser apenas: `audiodescricao` salva (ou recebida) → para obras fixas legadas sem audiodescrição, o texto estático da obra. Se nada disso existir, retornar erro claro: "Gere e salve o texto da audiodescrição antes de gerar a locução."

### 2. Admin UI — `src/routes/admin.tsx`

- Em `handleRegenerar`, passar o conteúdo atual do estado `audiodescricao` para `regenerar({ data: { chave: num, audiodescricao } })`, de modo que "Gerar locução" sempre use (e persista) o texto exibido na caixa, sem exigir um "Salvar audiodescrição" prévio.
- Após gerar, atualizar o histórico (já ocorre via `recarregarHist`).
- A geração em lote ("Gerar locução de todas as obras") continua chamando `regenerar({ data: { chave } })` sem o texto, lendo a audiodescrição salva no banco.

## Observações

- Nenhuma mudança de schema é necessária (a coluna `audiodescricao` já existe).
- O campo "Descrição (referência)" deixa de influenciar a locução em qualquer cenário.
- Obras fixas antigas sem audiodescrição salva ainda funcionam via texto estático até serem editadas.
