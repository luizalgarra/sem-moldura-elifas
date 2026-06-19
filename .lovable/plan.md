## Objetivo

Ajustar a geração de audiodescrição (função `gerarTextoDescricao` em `src/lib/admin-obras.functions.ts`) para que a descrição atual seja usada apenas como **base/referência de contexto**, sem que seu texto seja reproduzido na íntegra no resultado.

## Situação atual

Hoje o prompt envia o texto existente rotulado como "Informações e descrição já existentes" e a IA tende a integrá-lo (podendo copiar trechos literais) ao gerar a audiodescrição.

## O que será feito

1. **Reforçar a instrução do sistema** (`system`)
   - Acrescentar diretriz explícita: usar a descrição existente apenas como referência de contexto/fatos (título, autor, ano, técnica, dimensão, elementos já citados) e **não reproduzir seu texto literalmente**; a audiodescrição deve ser escrita do zero a partir da análise da imagem, redigida com palavras próprias.

2. **Reformular o bloco do usuário** (`userText`)
   - Manter o envio da descrição atual, mas com rótulo que deixe claro o papel de apoio (ex.: "Texto de referência (não copie; use apenas como contexto)") em vez de "descrição já existente".

## Resultado esperado

- A IA continua se apoiando nas informações da descrição atual (fatos e dados de catálogo), porém o resultado é um texto novo, sem trechos copiados na íntegra do texto anterior.
- Nenhuma mudança de UI, schema, RLS ou novos segredos; o fluxo de revisão/salvamento permanece igual.
