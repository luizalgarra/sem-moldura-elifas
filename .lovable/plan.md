## Objetivo

Ampliar a áudio-descrição da **Obra 2 – Arca de Noé** com um segundo bloco: a **análise interpretativa** enviada. Esse bloco será narrado por uma **voz feminina (Matilda, calorosa)** e **emendado em sequência direta** ao áudio masculino (Daniel) já gerado, formando um único MP3 contínuo. O texto da análise também será acrescentado ao texto escrito da página.

## Etapas

### 1. Recuperar o áudio masculino atual (Parte 1)
- Baixar o MP3 atualmente referenciado em `src/assets/audio/obra-2.mp3.asset.json` (descrição, voz Daniel) para o sandbox, para reaproveitá-lo como primeira parte — sem regerar a descrição.

### 2. Gerar o áudio da análise (Parte 2, voz feminina)
- Preparar o texto da análise interpretativa para narração: remover títulos/marcações que não devem ser lidos como rótulo, normalizar números (ex.: "1980", "1981" → por extenso) e ajustar pontuação para pausas naturais.
- Chamar a API Text-to-Speech da ElevenLabs com:
  - Voz **Matilda** (`XrExE9yKIg1WjnnlVkGX`)
  - Modelo `eleven_multilingual_v2`, saída `mp3_44100_128`
  - Ajustes para audiodescrição: `stability ~0.6`, `similarity_boost 0.75`, `style ~0.2`, `use_speaker_boost true`, ritmo levemente reduzido (`speed 0.95`)
- Conferir idioma, pausas e qualidade.

### 3. Unir os dois áudios sem cortes
- Concatenar Parte 1 (Daniel) + Parte 2 (Matilda) em um único MP3 contínuo, **emendado direto** (sem pausa nem separação), usando `ffmpeg` (concat reencodando para um stream homogêneo).
- Conferir o arquivo final (duração = soma das partes, transição limpa).

### 4. Substituir o asset da Obra 2
- Fazer upload do MP3 unificado via `lovable-assets`, regenerando `src/assets/audio/obra-2.mp3.asset.json` (a URL/asset_id muda; o mapeamento por glob em `obras.ts` continua funcionando sem mudança de código).

### 5. Atualizar a descrição da Obra 2 na página
- Em `src/data/obras.ts`, no campo `descricao` da Obra 2, acrescentar a **análise interpretativa** após a descrição visual existente, separada por quebra de parágrafo, em texto corrido e limpo (sem marcações).

### 6. Verificação
- Abrir `/obras/2` no preview e validar:
  - O player toca um único áudio que começa na voz masculina (descrição) e segue, sem corte, na voz feminina (análise).
  - O texto da página mostra a descrição visual seguida da análise interpretativa.

## Detalhes técnicos
- Geração e concatenação rodam no sandbox via `code--exec`, usando o secret `ELEVENLABS_API_KEY` — sem expor chave no front-end e sem custo por visita.
- `ffmpeg` já está disponível no ambiente.
- Apenas a Obra 2 é afetada; as outras 84 obras permanecem como estão.
- `AudioDescricao.tsx` e `obras.$num.tsx` não precisam mudar — já consomem `obra.audio` e `obra.descricao`.

## Fora de escopo
- Regerar a descrição (Parte 1) — será reaproveitada como está.
- Trocar a voz das outras obras.
- Mudanças visuais/layout da página.
