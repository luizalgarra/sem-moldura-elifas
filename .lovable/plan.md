## Objetivo

Ampliar a lista de vozes disponíveis no seletor do painel `/admin`, mantendo Sarah e George e adicionando várias outras vozes da ElevenLabs (modelo multilingual) para escolha.

## Mudança (apenas `src/data/vozes.ts`)

Expandir o array `VOZES` para incluir, além de Sarah e George, as principais vozes da biblioteca ElevenLabs com seus IDs oficiais, nome amigável, descrição e gênero. Vozes a incluir:

Femininas:
- Sarah (`EXAVITQu4vr4xnSDxMaL`) — suave *(já existe)*
- Laura (`FGY2WhTYpPnrIDTdsKH5`) — jovem, animada
- Alice (`Xb7hH8MSUJpSbSDYk0k2`) — clara, britânica
- Matilda (`XrExE9yKIg1WjnnlVkGX`) — calorosa
- Jessica (`cgSgspJ2msm6clMCkdW9`) — expressiva
- Lily (`pFZP5JQG7iQjIQuC4Bku`) — suave, britânica

Masculinas:
- George (`JBFqnCBsd6RMkjVDRZzb`) — madura *(já existe)*
- Roger (`CwhRBWXzGAHq8TQ4Fs17`) — natural
- Charlie (`IKne3meq5aSn9XLyUdCD`) — confiante, australiana
- Callum (`N2lVS1w4EtoT3dr4eOWO`) — intensa
- Liam (`TX3LPaxmHKxFdv7VOQHJ`) — articulada
- Will (`bIHbv24MWmeRgasZH58o`) — amigável
- Eric (`cjVigY5qzO86Huf0OWal`) — clássica
- Chris (`iP95p4xoKVk53GoZ742B`) — casual
- Brian (`nPczCjzI2devNBz1zQrb`) — profunda
- Daniel (`onwK4e9ZLuTAKqWW03F9`) — locução
- Bill (`pqHfZKP75CvOlQylNhV4`) — narração

`VOZ_PADRAO_ID` continua sendo Sarah. `vozValida()` passa a aceitar todos os IDs da lista automaticamente.

## Impacto

- O seletor em `src/routes/admin.tsx` lê de `VOZES`, então exibirá todas as opções sem mudanças nele.
- A validação em `regenerarAudio` (`src/lib/admin-obras.functions.ts`) já usa `vozValida()`, então qualquer uma das novas vozes é aceita.
- Sem mudanças de banco de dados nem novas chaves de API (já usa `ELEVENLABS_API_KEY`).
