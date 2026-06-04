## Objetivo

Substituir, apenas para a **Obra 2 – Arca de Noé**, tanto o **áudio narrado** quanto o **texto da descrição** exibido na página, usando o novo texto de audiodescrição imersiva. A locução será feita na voz **Daniel** (masculina, suave) da ElevenLabs, com as marcações `[/]` e `[//]` convertidas em pausas naturais.

## Etapas

### 1. Preparar dois textos a partir do roteiro

A partir do texto enviado, gero duas versões:

- **Texto para narração (TTS)**: removo a linha de "Orientações ao locutor" e converto as marcações em pausas naturais:
  - `[/]` → vírgula / pausa curta de respiração
  - `[//]` → ponto final + quebra de parágrafo (pausa média entre blocos)
  - As aspas de títulos viram pausa de entonação natural.
- **Texto para a página** (`descricao` em `obras.ts`): versão limpa, sem marcações nem orientações, em parágrafos corridos (mantém a mesma redação descritiva).

### 2. Gerar o novo MP3 (sandbox, voz Daniel)

- Chamar a API Text-to-Speech da ElevenLabs com:
  - Voz **Daniel** (`onwK4e9ZLuTAKqWW03F9`)
  - Modelo `eleven_multilingual_v2`, saída `mp3_44100_128`
  - Ajustes para audiodescrição: `stability ~0.6`, `similarity_boost 0.75`, `style ~0.2`, `use_speaker_boost true`, ritmo levemente reduzido
- Conferir o áudio gerado (idioma, pausas, qualidade).

### 3. Substituir o asset da Obra 2

- Apagar o asset atual `src/assets/audio/obra-2.mp3.asset.json`.
- Fazer upload do novo MP3 via `lovable-assets`, gerando novamente `src/assets/audio/obra-2.mp3.asset.json` (a URL/asset_id muda; o mapeamento em `obras.ts` já carrega por glob, então continua funcionando sem alterações de código).

### 4. Atualizar a descrição da Obra 2

- Em `src/data/obras.ts`, substituir o campo `descricao` da Obra 2 pela versão limpa do novo texto.
- Os demais campos (título, autor, ano, técnica, dimensão) permanecem inalterados.

### 5. Verificação

- Abrir `/obras/2` no preview e validar:
  - O player toca o novo áudio na voz Daniel.
  - O texto da descrição reflete o novo roteiro.

## Detalhes técnicos

- A geração roda no sandbox via script (`code--exec`), usando o secret `ELEVENLABS_API_KEY` já configurado — sem expor a chave no front-end e sem custo por visita.
- Apenas a Obra 2 é afetada; as outras 84 obras permanecem como estão.
- O componente `AudioDescricao.tsx` e a página `obras.$num.tsx` não precisam mudar — já consomem `obra.audio` e `obra.descricao`.

## Fora de escopo

- Trocar a voz das outras obras (continuam com Sarah).
- Mudanças visuais/layout da página da obra.
