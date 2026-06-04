# Incluir obra renumerando a sequência

Hoje cada obra tem um número fixo que serve para tudo: ordem de exibição, nome do arquivo de imagem/áudio e link/QR. Por isso, simplesmente "empurrar" os números quebra a ligação com as imagens e áudios originais.

Para você poder incluir uma obra em qualquer posição e fazer todas as seguintes subirem um número, vou separar dois conceitos:

- **Identidade interna (fixa)**: um código que nunca muda, usado só para achar a imagem e o áudio certos de cada obra. Você nunca vê isso.
- **Número exibido (posição)**: o número que aparece no site, no QR e nos links. É esse que entra em sequência e se reorganiza quando você inclui ou remove uma obra.

## Como vai funcionar para você

- Ao incluir uma obra, em vez de digitar um número livre, você escolhe **em qual posição** ela entra (ex.: "entrar como nº 5").
- Todas as obras da posição 5 em diante sobem +1 automaticamente (5→6, 6→7, ...), incluindo as 116 originais.
- Ao remover uma obra, a sequência se fecha: as seguintes descem -1, sem deixar buracos.
- A numeração fica sempre contínua (1, 2, 3, ... sem falhas).
- Como combinado: QR codes e links já impressos podem passar a apontar para outra obra após reorganizar — isso é esperado.

## O que muda na prática

- A inclusão deixa de pedir "número da obra" e passa a pedir "posição na sequência".
- A imagem e o áudio de cada obra continuam corretos mesmo depois de várias inclusões/remoções, porque eles seguem a identidade interna, não a posição.

## Detalhes técnicos

### Banco de dados (migração)

- Nova tabela `acervo_ordem`:
  - `chave` (int, PK) = identidade interna da obra (para as 116 originais é o número original 1–116; para obras novas, um id ≥ 1000 gerado automaticamente).
  - `posicao` (int, único) = número exibido.
  - GRANT para `service_role`, RLS habilitada (acesso só via servidor, como hoje).
- `obras_extras`: a coluna `num` passa a guardar a **identidade interna** (≥ 1000), não mais o número escolhido pelo usuário. Imagens/áudios no storage continuam nomeados por essa identidade.
- `obra_overrides` e `obras_ocultas` permanecem chaveadas pela identidade (número original das fixas) — sem mudança estrutural.

### Servidor (`src/lib/admin-obras.functions.ts`)

- Helper `materializarOrdem()`: se `acervo_ordem` estiver vazia, popula com a ordem atual (fixas 1–116 menos ocultas, na ordem original; depois extras existentes). A partir daí toda inclusão/remoção opera sobre essa tabela.
- `listarAcervo`: passa a montar a lista pela `acervo_ordem` (ordenada por `posicao`), resolvendo cada `chave` para os dados (fixa+override ou extra) e definindo o **número exibido = posicao**. URLs de imagem/áudio passam a usar a identidade interna (chave), não a posição.
- `criarObra({ posicao, ...dados })`:
  1. gera identidade ≥ 1000, grava em `obras_extras`;
  2. `UPDATE acervo_ordem SET posicao = posicao + 1 WHERE posicao >= :posicao`;
  3. insere a nova `chave` na `posicao` escolhida.
- `removerObra({ posicao })`: resolve a `chave`; se fixa → registra em `obras_ocultas`, se extra → apaga registro + arquivos; remove a linha da ordem e compacta (`posicao = posicao - 1 WHERE posicao > removida`).
- `salvarDados`, `salvarImagem`, `salvarTexto`, `regenerarAudio`, `getObraPublica`: passam a receber/usar a **identidade interna** (resolvida a partir da posição quando vierem da URL pública), em vez do número exibido.

### Páginas e rotas

- `/editar`: formulário "Nova obra" troca o campo "número" por "posição na sequência"; cada cartão usa a identidade para salvar e a posição para exibir; botão "Remover" opera por posição.
- `/obras` e `/obras/$num`: continuam usando o número exibido na URL; o loader converte posição → identidade via `acervo_ordem`.
- `/api/public/obra-imagem/$num` e `/api/public/obra-audio/$num`: o parâmetro passa a ser a **identidade interna** (a URL é montada pelo servidor), mantendo a mídia correta após renumeração.

## Observação

Por reorganizar todo o acervo, recomendo conferir o acervo após a primeira inclusão para validar a sequência. As obras novas continuam começando sem áudio e podem gerar a narração pelo botão existente.
