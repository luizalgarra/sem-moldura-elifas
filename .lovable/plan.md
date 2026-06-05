## Objetivo

No seletor de voz do admin, mostrar **apenas vozes brasileiras** (português do Brasil) e **as suas próprias vozes** (clonadas/geradas na sua conta ElevenLabs), removendo todas as vozes em inglês.

## O que muda

Editar somente `src/data/vozes.ts` — a lista `VOZES`. Nenhuma mudança de banco, API ou de outra tela. O botão de amostra e a regeneração continuam funcionando, pois usam essa mesma lista.

### Vozes brasileiras (profissionais, pt-BR)

- Carla – Rural, dinâmica (feminina)
- Carla – Conversacional (feminina)
- Adult Brazilian woman (feminina)
- Fernanda – formal e neutra (feminina)
- Israela (feminina)
- Roberta – conversacional (feminina)
- Yasmin (feminina)
- Eduardo S. – claro e profissional (masculina)
- Lucas – narrador profundo (masculina)
- Danilo Tenfen – voz documental (masculina)

### Minhas vozes (clonadas/geradas na sua conta)

- Clau Q 2 (clonada)
- Olivia G (clonada)
- Claudia Q (clonada)
- Nelma Narradora (gerada)
- Ricardo Porto Bank (gerada)
- Rubens Portela (gerada)
- voz tratamento esgoto (clonada)

> Observação: a voz "Adilson" foi descartada por ser **português europeu**, não brasileiro.

### Voz padrão

Como Sarah (inglês) sai da lista, a voz padrão (`VOZ_PADRAO_ID`) passa a ser uma voz brasileira — sugestão **Fernanda** (formal e neutra), boa para áudio-descrição. Áudios já gerados continuam tocando normalmente; ao reabrir uma obra antiga, o seletor simplesmente mostrará a voz padrão se a antiga não estiver mais na lista.

## Detalhes técnicos

- Reescrever o array `VOZES` com os IDs acima, separados por comentários `// Brasileiras` e `// Minhas vozes`, mantendo o campo `genero` para o agrupamento existente na UI.
- Atualizar `VOZ_PADRAO_ID` para o ID da Fernanda (`KHmfNHtEjHhLK9eER20w`).
- `vozValida()` e `IDS_VALIDOS` continuam derivando automaticamente do array, sem alteração de lógica.
