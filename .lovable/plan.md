## Objetivo

Adicionar um botão de **amostra** ao lado do seletor de voz no painel `/admin`, para ouvir como soa a voz selecionada antes de regenerar o áudio da obra.

## Abordagem

Cada voz da ElevenLabs tem uma URL de prévia (`preview_url`) — um MP3 curto hospedado pela própria ElevenLabs. Vamos buscar essa URL via API (sem custo de geração de áudio) e tocá-la no navegador.

## Mudanças

### 1. Nova server function — `src/lib/admin-obras.functions.ts`

Adicionar `amostraVoz`:
- Recebe `vozId` (validado com `vozValida()` e `z`).
- Lê `ELEVENLABS_API_KEY` de `process.env`.
- Faz `GET https://api.elevenlabs.io/v1/voices/{vozId}` com header `xi-api-key`.
- Retorna `{ ok: true, url: preview_url }` ou `{ ok: false, erro }`.

### 2. UI — `src/routes/admin.tsx`

- Importar o ícone `Volume2` (e `Loader2` já existe) de `lucide-react` e a função `amostraVoz`.
- No componente `ObraEditor`, ao lado do `<Select>` de voz, adicionar um botão **"Ouvir amostra"**:
  - Ao clicar: chama `amostraVoz({ data: { vozId } })`, recebe a URL e toca com um `new Audio(url)`.
  - Mostra estado de carregamento (spinner) enquanto busca; reaproveita um cache local (`Map` por `vozId`) para não rebuscar a mesma voz.
  - Em erro, exibe mensagem na área de status já existente (`setMsg`).
- O botão fica visível apenas quando a obra não é protegida (mesma condição do seletor de voz).

## Detalhes técnicos

- A reprodução usa `new Audio(previewUrl).play()` no handler do clique (gesto do usuário), evitando bloqueio de autoplay.
- Sem mudanças de banco de dados. Usa a chave `ELEVENLABS_API_KEY` já existente.
- `amostraVoz` não gera fala nova (apenas lê metadados da voz), então não consome créditos de TTS.
