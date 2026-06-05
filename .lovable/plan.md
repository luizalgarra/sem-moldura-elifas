## Objetivo
Permitir escolher a voz (incluindo vozes masculinas) ao regenerar o áudio de cada obra no painel `/admin`, sem precisar saber o ID da voz.

## O que muda

### 1. Lista de vozes nomeadas
Criar uma pequena lista de vozes disponíveis (nome amigável → ID do ElevenLabs), com opções femininas e masculinas:
- Sarah (feminina, suave) — `EXAVITQu4vr4xnSDxMaL` (padrão atual)
- Alice (feminina) — `Xb7hH8MSUJpSbSDYk0k2`
- George (masculina, madura) — `JBFqnCBsd6RMkjVDRZzb`
- Brian (masculina, grave) — `nPczCjzI2devNBz1zQrb`
- Daniel (masculina, locução) — `onwK4e9ZLuTAKqWW03F9`

### 2. Seletor de voz no painel admin
Em cada obra (componente `ObraEditor` em `src/routes/admin.tsx`), adicionar um menu suspenso "Voz" ao lado do botão "Regenerar áudio". Ele já vem pré-selecionado com a voz atual da obra (campo `voz_id`) ou a Sarah por padrão.

### 3. Passar a voz escolhida para a geração
Ajustar a função `regenerarAudio` (`src/lib/admin-obras.functions.ts`) para aceitar um `vozId` opcional vindo do painel. Hoje ela só lê o `voz_id` já salvo no banco; passará a usar a voz escolhida na tela, validando que o ID pertence à lista de vozes permitidas (segurança). A voz escolhida é salva no campo `voz_id` da obra, então fica memorizada para a próxima vez.

### 4. Obra protegida
A obra nº 2 (Arca de Noé, áudio especial com duas vozes) continua bloqueada — sem seletor nem regeneração, como já é hoje.

## Detalhes técnicos
- `regenerarAudio` recebe `{ chave, vozId? }`; valida `vozId` contra a lista permitida; faz fallback para o `voz_id` salvo ou Sarah.
- O `upsert` em `obra_overrides` já grava `voz_id`, então a escolha persiste.
- Nenhuma mudança de banco é necessária (coluna `voz_id` já existe).
- Sem necessidade de nova chave de API — usa a `ELEVENLABS_API_KEY` já configurada.

## Resultado
No painel, você seleciona "George" (ou outra voz masculina) na obra desejada, clica em "Regenerar áudio", ouve o resultado no player, e a voz fica salva para aquela obra.