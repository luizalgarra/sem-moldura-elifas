## Objetivo

Cada obra passa a ter **duas locuções padrão**: feminina (**Carla**) e masculina (**Danilo Tenfen**). A geração é em lote (gera as duas de uma vez), tanto por obra quanto para todas. No site público, o visitante alterna entre voz feminina e masculina.

## Banco de dados (migração)

Adicionar duas colunas em `obra_overrides` e `obras_extras`:
- `audio_fem_path text` — caminho do MP3 da voz feminina (Carla)
- `audio_masc_path text` — caminho do MP3 da voz masculina (Danilo)

A coluna atual `audio_url` é mantida (usada pela obra especial #2 e como fallback). `voz_id` deixa de ser usada para a escolha, mas permanece para não quebrar registros antigos.

## Vozes (`src/data/vozes.ts`)

Exportar constantes:
- `VOZ_FEMININA_ID = "7eUAxNOneHxqfyRS77mW"` (Carla)
- `VOZ_MASCULINA_ID = "rVRk0uJAtO8T38Gm03mf"` (Danilo Tenfen)

## Backend (`src/lib/admin-obras.functions.ts`)

- **`regenerarAudio`**: passa a gerar **as duas vozes** para uma obra (Carla e Danilo), salvando em `audio_fem_path` e `audio_masc_path`. Retorna `versao` e quais vozes foram geradas. A obra protegida (#2) continua bloqueada.
- **`construirAcervo`** e `ObraAcervo`: expor `audioFem` e `audioMasc` (URLs `/api/public/obra-audio/<num>?voz=fem|masc`). Manter `audio` como fallback (feminina, ou o áudio especial da #2).
- **`listarOverrides`**: incluir `audioFemPath` e `audioMascPath` para o admin saber o que já existe.

## Rota pública de áudio (`src/routes/api/public/obra-audio.$num.ts`)

- Ler o query param `voz` (`fem` | `masc`, padrão `fem`).
- Servir `audio_fem_path` ou `audio_masc_path`; se faltar, cair para `audio_url`.

## Admin (`src/routes/admin.tsx`)

- Os dois botões de voz no topo deixam de ser "voz ativa": viram referência/amostra das duas vozes padrão.
- Adicionar botão geral **"Gerar áudios de todas as obras (Carla + Danilo)"** que percorre as obras no cliente, chamando `regenerarAudio` por obra em sequência, com indicador de progresso.
- Em cada obra, o botão passa a ser **"Gerar áudios (Carla + Danilo)"**, gerando as duas vozes.
- Player de prévia por obra mostra a versão feminina e a masculina.

## Site público (`AudioDescricao.tsx` + `obras.$num.tsx`)

- `AudioDescricao` recebe `audioFem` e `audioMasc`.
- Adicionar um seletor **Feminina / Masculina** que troca o `src` do player. Esconde o seletor quando só existe uma das vozes (ex.: obra especial #2).
- Reproduz com os controles atuais (ouvir, parar, velocidade).

## Observações técnicas

- A geração em lote é feita no cliente (um pedido por obra) para evitar timeout do runtime serverless em chamadas longas à ElevenLabs.
- Cada `regenerarAudio` faz duas chamadas à ElevenLabs (uma por voz) e dois uploads no bucket `audios-obras`.
