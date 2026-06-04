# Incluir e remover obras

Hoje as 116 obras são fixas no código (`src/data/obras.ts`) e o banco só guarda *edições* (tabela `obra_overrides`). Para incluir obras novas e remover existentes, vou criar uma **camada dinâmica no banco** que é mesclada com as obras fixas em todas as páginas.

## Como vai funcionar

- **Incluir**: na página `/editar`, um bloco "Nova obra" no topo onde você digita o número (você escolhe), título, ano, autor, técnica, dimensão, parede, descrição e envia a imagem. A obra passa a aparecer no acervo e na página individual.
- **Remover**: um botão "Remover" em cada obra.
  - Se for uma das 116 originais → ela é **ocultada** do site (as originais vivem no código e não podem ser apagadas de lá, mas somem para os visitantes; reversível no banco).
  - Se for uma obra que você criou → é **apagada de vez** (registro e imagem removidos).
- Cada remoção pede confirmação para evitar engano.

## Banco de dados (migração)

- Nova tabela `obras_extras`: guarda as obras criadas por você — `num` (escolhido, único), `titulo`, `ano`, `autor`, `tecnica`, `dimensao`, `parede`, `descricao`, `imagem_path`, `audio_url`, `voz_id`.
- Nova tabela `obras_ocultas`: lista os números das obras originais que foram removidas (ocultadas) do site.
- Ambas com GRANT para `service_role` e RLS habilitada (acesso só pelo servidor, como já é feito hoje).

## Servidor (`src/lib/admin-obras.functions.ts`)

- `listarAcervo` (GET público): devolve a lista final = 116 fixas − ocultas + extras, já com as edições do `obra_overrides` aplicadas. Será a fonte única do acervo e da página de edição.
- `criarObra` (POST): valida que o número não colide com uma obra fixa nem com outra extra; grava em `obras_extras`.
- `removerObra` (POST): se o número é fixo → registra em `obras_ocultas`; se é extra → apaga o registro e a imagem no storage.
- Ajustar `salvarDados`, `salvarImagem` e `regenerarAudio` para também funcionar com obras extras (gravando em `obras_extras` quando o número não pertence às fixas).

## Páginas

- **`/editar`**: passa a carregar o acervo via `listarAcervo`; adiciona o formulário "Nova obra" e o botão "Remover" (com confirmação) em cada cartão.
- **`/obras` (acervo)**: passa a carregar a lista via `listarAcervo` (em vez do array fixo direto), para refletir inclusões e remoções.
- **`/obras/$num`**: o loader passa a considerar obras extras e a retornar "não encontrada" para obras ocultas/removidas.
- **`/api/public/obra-imagem/$num`**: além de `obra_overrides`, passa a servir também a imagem de obras extras.

## Observações

- As obras novas começam sem áudio; depois você pode gerar a narração pelo botão "Regenerar áudio" já existente, que passará a funcionar para elas.
- Nenhuma mudança visual no site público além de obras aparecerem/sumirem conforme você incluir/remover.
