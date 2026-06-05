## Objetivo

Substituir a escolha de voz **por obra** por uma única escolha **global**: alternar entre a voz feminina padrão (**Carla**) e a masculina padrão (**Danilo Tenfen**). Os seletores de voz de cada obra desaparecem.

## O que muda

Editar apenas `src/routes/admin.tsx`.

### Controle global (topo da página)

- Adicionar, abaixo do cabeçalho, um seletor único com duas opções:
  - **Carla** (feminina) — `7eUAxNOneHxqfyRS77mW`
  - **Danilo Tenfen** (masculina) — `rVRk0uJAtO8T38Gm03mf`
- Estado `vozGlobal` em `AdminPagina`, iniciando em Carla.
- Botão **Ouvir amostra** ao lado, usando a função `amostraVoz` já existente, para a voz global escolhida.
- Essa voz vale para **todas** as regenerações de áudio.

### Em cada obra (ObraEditor)

- Remover o `<Select>` de voz e o botão "Ouvir amostra" individuais.
- O botão **Regenerar áudio** passa a usar a voz global (recebida via prop), em vez do estado local.
- Mantém intactos: edição de texto, salvar, player e botão de baixar áudio.

## Detalhes técnicos

- `AdminPagina` passa `vozId={vozGlobal}` para cada `ObraEditor`.
- Em `ObraEditor`, remover os estados `vozId`, `tocandoAmostra` e a função `handleAmostra`; `handleRegenerar` usa a prop `vozId`.
- A lógica de amostra (cache + `new Audio().play()`) sobe para `AdminPagina`.
- `VOZES` e `vozes.ts` permanecem como estão (a lista completa continua válida no backend); o admin apenas oferece as duas opções padrão.
