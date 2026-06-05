## Objetivo

Substituir o modelo atual (dois MP3s completos + botão de alternar voz) por uma **locução única alternada por seção**. O player abre direto pela audiodescrição e reveza as vozes na ordem:

```text
1. Audiodescrição              → voz masculina (Danilo)
2. Identificação da obra       → voz feminina (Carla)
3. Contexto histórico/cultural → voz masculina (Danilo)
4. Análise interpretativa      → voz feminina (Carla)
```

A imagem mental (descrição) vem primeiro; as vozes se revezam entre "fato" e "leitura".

## Como vai funcionar

- Cada obra passa a ter **4 trechos de áudio**, cada um já gravado com a voz definida pela posição (masc, fem, masc, fem).
- No site público, ao tocar, o player reproduz os 4 trechos **em sequência automática**, sem corte perceptível. O botão "alternar voz" sai.
- Os controles atuais (Ouvir/Pausar, Parar, velocidade 0,75×/1×/1,25×) continuam, agora atuando sobre a sequência inteira.
- Um pequeno indicador mostra qual seção está tocando (ex.: "Audiodescrição · voz masculina").

## Divisão do texto em seções

A divisão usa os títulos gerados pelo prompt: **Identificação da obra**, **Audiodescrição**, **Contexto histórico e cultural**, **Análise interpretativa**.

- Quando os títulos existem (como na obra #53), cada seção vira um trecho, reordenados para a sequência de reprodução (descrição primeiro).
- Quando a obra **não tem esses títulos** (a maioria hoje), o texto é dividido "como der": quebrado em 4 blocos aproximadamente iguais por parágrafos/frases, recebendo as vozes na mesma ordem alternada (masc, fem, masc, fem). Assim toda obra ganha o efeito de revezamento mesmo sem estrutura formal.
- A obra protegida #2 (áudio especial) continua intocada.

## Etapas

### 1. Banco de dados (migração)
Adicionar uma coluna `audio_trechos jsonb` em `obra_overrides` e `obras_extras`, guardando a lista ordenada de trechos: `[{ ordem, rotulo, voz, path }]`. As colunas antigas (`audio_url`, `audio_fem_path`, `audio_masc_path`) permanecem para não quebrar a obra #2 e registros legados.

### 2. Backend (`src/lib/admin-obras.functions.ts`)
- Nova função utilitária que **separa o texto em seções** (com títulos ou por blocos) e devolve a lista ordenada com a voz de cada trecho.
- `regenerarAudio`: passa a gerar **um clipe por trecho** (4 chamadas à ElevenLabs, em paralelo), faz upload de cada um e salva o array em `audio_trechos`.
- `construirAcervo`/`ObraAcervo`: expõe `audioTrechos` — lista de `{ rotulo, voz, url }` apontando para a rota pública com índice. Mantém `audio` como fallback (obra #2 e legados).

### 3. Rota pública de áudio (`src/routes/api/public/obra-audio.$num.ts`)
- Aceitar o parâmetro `trecho` (índice 0..3) e servir o arquivo correspondente lido de `audio_trechos`.
- Manter o comportamento antigo (`voz=fem|masc` / `audio_url`) como fallback para a obra #2.

### 4. Player do site (`src/components/AudioDescricao.tsx` + `obras.$num.tsx`)
- Trocar a lógica de "um `<audio>` com troca de `src`" por **reprodução encadeada** dos trechos: ao terminar um, inicia o próximo automaticamente.
- Remover o seletor feminina/masculina.
- Pausar/continuar e parar atuam sobre a sequência; a velocidade é aplicada a todos os trechos.
- Mostrar o rótulo da seção atual e a voz.
- Fallback: obra #2 (áudio único) e obras sem trechos gerados continuam tocando o arquivo completo atual; sem nenhum áudio, cai na leitura por voz do navegador.

### 5. Admin (`src/routes/admin.tsx`)
- O botão por obra e o de lote continuam, mas agora geram os **4 trechos alternados**.
- A prévia por obra mostra os 4 players na ordem de reprodução, cada um rotulado (ex.: "1 · Audiodescrição · masculina").
- Atualizar os textos de ajuda para refletir o novo modelo.

## Observações técnicas

- A geração continua no cliente (uma chamada `regenerarAudio` por obra) para evitar timeout; dentro do servidor, os 4 trechos são gerados em paralelo.
- Para naturalidade entre cortes, as chamadas à ElevenLabs podem usar `previous_text`/`next_text` (request stitching) com os trechos vizinhos.
- Como o esquema de seções muda, **será preciso regenerar os áudios** (em lote) depois da implementação para todas as obras passarem a ter os 4 trechos. Antes disso, elas seguem tocando o áudio antigo via fallback.
- A obra #53 (Adoniran Palhaço) ainda aguarda sua geração de áudio aprovada por você; com este modelo, ela será gerada já com os 4 trechos.
