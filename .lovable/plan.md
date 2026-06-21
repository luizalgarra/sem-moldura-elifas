# Acompanhamento de custo da geração de áudio

## Objetivo
A geração de locução (obra #5 e demais) é feita pelo ElevenLabs, que **cobra por caractere** — esse custo NÃO sai dos créditos da Lovable, sai da sua conta ElevenLabs. Hoje o app gera o áudio mas não guarda nenhum registro de quanto custou. O plano cria um registro automático por geração e uma visão no painel admin, para você acompanhar o consumo sem precisar abrir o painel do ElevenLabs.

## O que será entregue
1. **Registro automático por geração**: a cada vez que um áudio é gerado, o sistema grava a obra, a data e o nº de caracteres do texto enviado ao ElevenLabs.
2. **Estimativa de custo**: a partir dos caracteres, mostra um custo aproximado em dólar (com base na tarifa do plano ElevenLabs, configurável).
3. **Painel no admin**: uma seção mostrando, por obra e no total, quantos caracteres já foram consumidos e o custo estimado.

## Como funciona (técnico)

### 1. Nova tabela `geracoes_audio` (migração)
Guarda um histórico de cada geração:
- `id uuid` (pk)
- `num integer` (a obra/chave)
- `caracteres integer` (tamanho do texto enviado)
- `voz_id text`
- `created_at timestamptz default now()`

Com `GRANT` para `authenticated`/`service_role` e RLS: leitura apenas para admin via `is_admin()`. Inserção só acontece pelo servidor (service role).

### 2. Gravar o consumo em `regenerarAudio`
Em `src/lib/admin-obras.functions.ts`, dentro de `regenerarAudio` (e na geração em lote, se houver), após gerar o áudio com sucesso:
- calcular `caracteres = texto.length` (o mesmo texto enviado ao ElevenLabs);
- inserir uma linha em `geracoes_audio` via `supabaseAdmin`.

Isso reflete fielmente o que o ElevenLabs cobra, pois a tarifa deles é por caractere do texto enviado.

### 3. Nova server function `resumoConsumoAudio`
Função protegida (`requireSupabaseAuth` + checagem de admin) que retorna:
- total de caracteres e custo estimado;
- lista por obra (caracteres somados, nº de gerações).

### 4. Seção no painel admin (`src/routes/admin.tsx`)
- Card "Consumo de voz (ElevenLabs)" com total de caracteres, custo estimado e tabela por obra.
- Carregado via `useQuery` só quando há sessão admin (mesmo padrão já usado para `listarOverrides`).

## Sobre a estimativa de custo
A tarifa por caractere varia conforme o plano ElevenLabs. Vou usar uma constante configurável (ex.: `USD_POR_MILHAO_CARACTERES`) no código, com um valor padrão, e mostro o custo como **estimativa**. O valor oficial e definitivo continua sendo o do painel da sua conta ElevenLabs.

## Observações
- O histórico só passa a registrar a partir de agora; gerações anteriores (como já feitas) não têm registro retroativo, pois esse dado não foi salvo antes.
- Nenhuma mudança na forma de gerar/tocar áudio — só acréscimo de registro e visualização.

```text
Gerar áudio ──> ElevenLabs (cobra por caractere)
            └─> grava linha em geracoes_audio (num, caracteres, data)
                              │
Admin ──> resumoConsumoAudio ─┘──> Card "Consumo de voz" (total + por obra + custo estimado)
```
