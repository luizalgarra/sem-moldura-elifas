## Objetivo

Gerar, uma única vez, um arquivo de áudio (MP3) da audiodescrição de cada obra usando a voz **Sarah** da ElevenLabs (modelo multilíngue, pt-BR) e servir esses áudios prontos no site. O player passa a tocar o MP3 de alta qualidade em vez da voz sintética do navegador.

## Como vai funcionar

```text
texto da obra  ->  ElevenLabs (voz Sarah)  ->  MP3
MP3            ->  Lovable Assets (CDN)     ->  obra-{n}.mp3.asset.json
página da obra ->  player toca o MP3 (fallback: voz do navegador)
```

## Etapas

1. **Chave da ElevenLabs**: solicitar o secret `ELEVENLABS_API_KEY` (você gera em elevenlabs.io → Profile → API Keys). É necessário antes de gerar os áudios.

2. **Script de geração (executado uma vez no sandbox)**:
   - Lê todas as obras de `src/data/obras.ts` (número + texto da descrição).
   - Para cada obra, chama a API de Text-to-Speech da ElevenLabs com a voz Sarah (`EXAVITQu4vr4xnSDxMaL`), modelo `eleven_multilingual_v2`, saída `mp3_44100_128`.
   - Salva cada MP3 e faz upload via `lovable-assets`, gravando `src/assets/audio/obra-{n}.mp3.asset.json`.
   - Pula obras que já tiverem o áudio gerado (permite reexecução incremental).

3. **Mapear áudio por obra**: em `src/data/obras.ts`, carregar os `*.asset.json` de áudio (mesmo padrão já usado para imagens) e adicionar o campo `audio: string | null` em cada obra.

4. **Atualizar o player `AudioDescricao.tsx`**:
   - Receber também a URL do áudio pré-gerado.
   - Quando houver MP3: usar um elemento `<audio>` (play/pausar/parar, controle de velocidade) tocando o arquivo da ElevenLabs.
   - Quando não houver MP3: manter o comportamento atual com `speechSynthesis` como fallback.
   - Passar `obra.audio` a partir de `src/routes/obras.$num.tsx`.

5. **Verificação**: conferir alguns áudios gerados (qualidade/idioma) e validar o player na página da obra.

## Detalhes técnicos

- A geração roda no sandbox via script (`code--exec`), não no app — evita expor a chave no front-end e não gera custo a cada acesso do visitante.
- Os MP3 ficam no CDN da Lovable (assets), então o site só serve arquivos estáticos; nenhuma chamada à ElevenLabs em produção.
- São ~85 obras; a geração é sequencial com pequeno intervalo entre chamadas para respeitar limites de taxa.
- Custo da ElevenLabs: consome créditos da sua conta apenas na geração (uma vez por texto). Reexecuções só geram o que faltar.
- Caso algum texto de obra seja editado depois, basta apagar o `*.mp3.asset.json` correspondente e rodar o script de novo para regenerar só aquele.

## Fora de escopo

- Voz por visitante / em tempo real (escolhemos pré-gerar).
- Troca de voz depois de gerado exige regerar os áudios (rodar o script novamente).
