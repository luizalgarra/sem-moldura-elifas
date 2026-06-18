# Locução em áudio único

Hoje a locução é gerada como vários **trechos** separados (`audio_trechos`), reproduzidos em sequência por um player especial. Esse mecanismo de trechos é a causa do problema de "apareceu e sumiu ao dar play". A correção é gerar **um único arquivo de áudio** por obra e usar um player simples.

## O que muda para você

- Ao clicar em **Gerar locução**, a obra terá **um único áudio** (uma voz, do começo ao fim), sem divisão em partes.
- No card do `/admin` aparece **um player só** (em vez da lista de trechos), e o botão de baixar pega esse áudio completo.
- Na página pública da obra, o áudio toca normalmente como arquivo único — sem o comportamento de pular/sumir entre trechos.

## Alterações técnicas

### 1. `src/lib/admin-obras.functions.ts` (geração)
- Em `regenerarAudio`: parar de dividir por seções/trechos. Gerar a locução do texto completo com **uma voz** (feminina, `VOZ_FEMININA_ID`).
  - Como o texto pode ser longo demais para uma única chamada da API de voz, dividir internamente em pedaços por frases (apenas por limite de tamanho, de forma conservadora), gerar cada pedaço com contexto (`previous_text`/`next_text`) e **concatenar os buffers MP3 em um único arquivo**. Isso é só para respeitar o limite da API — o resultado salvo é um arquivo único.
  - Fazer **um upload** do arquivo concatenado e salvar em `audio_fem_path`; limpar `audio_trechos`, `audio_masc_path` e `audio_url`.
  - Retornar `{ ok, versao }` (sem `trechos`).
- Manter `OBRA_PROTEGIDA` (#2) intocada.
- Remover/parar de usar a lógica de `SECOES`/`dividirTrechos` no caminho de geração (pode ficar uma função interna só de chunking por tamanho).

### 2. `src/routes/admin.tsx` (tela)
- Trocar a renderização da lista de trechos por **um único `<audio controls>`** apontando para `/api/public/obra-audio/{num}?voz=fem&v=...`, exibido quando a obra tiver `audioFemPath`.
- Ajustar o botão "Baixar" para esse mesmo áudio único.
- Mensagem após gerar: "Locução gerada." (sem contagem de trechos).

### 3. `src/components/AudioDescricao.tsx` (player público)
- Nenhuma mudança de lógica necessária: como `audio_trechos` ficará vazio e `audioFem` preenchido, o componente já cai no player de **arquivo único** (`AudioArquivo`). Opcionalmente remover o ramo de `AudioSequencia` se não for mais usado em nenhum lugar.

### 4. `src/routes/api/public/obra-audio.$num.ts` (rota)
- Já serve o arquivo único via `?voz=fem` (`audio_fem_path`). Sem mudança obrigatória; o ramo de `trecho` pode permanecer para compatibilidade com áudios antigos ou ser removido.

## O que NÃO muda
- Edição de textos, geração em lote (passará a gerar áudio único por obra), obra protegida #2, upload/preview de imagens.

## Observação
Áudios de trechos já gerados anteriormente continuarão tocando até você regerar a obra (a rota mantém compatibilidade). Ao clicar em **Gerar locução** novamente, a obra passa para o formato de áudio único.
