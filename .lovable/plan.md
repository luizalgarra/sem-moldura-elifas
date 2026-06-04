# Página de administração de textos e áudios

Criar uma página avulsa em `/admin` que lista todas as 85 obras, permite editar o texto (descrição) e regenerar o áudio com a mesma voz original de cada obra. As mudanças ficam salvas no backend (Lovable Cloud) e passam a aparecer para os visitantes.

## Decisões confirmadas
- **Persistência**: Lovable Cloud (banco + storage). Edições e novos áudios ficam salvos.
- **Acesso**: aberto por link secreto em `/admin` (sem login).
- **Voz**: cada obra regenera com sua voz original (registrada por obra; padrão Sarah, suave).
- **Obra 2**: preservada como está (áudio de duas vozes unidas). Botão de regenerar fica desativado para ela, evitando perder o áudio especial.

## Como vai funcionar

```text
/admin
 ├── lista das 85 obras (número, título, voz, status)
 ├── editar texto (descrição) ──► salvar ──► grava no banco
 └── regenerar áudio ──► server fn chama ElevenLabs ──► salva no Storage
                                                       └► grava URL no banco

/obras/$num (página pública)
 └── usa o texto/áudio salvos no banco quando existirem;
     senão, cai no texto/áudio estáticos atuais (fallback).
```

## Etapas

### 1. Habilitar Lovable Cloud
Ativar o backend para ter banco, storage e secrets.

### 2. Banco de dados
Criar a tabela `obra_overrides`:
- `num` (int, único) — número da obra
- `descricao` (text, nulável) — texto editado
- `audio_url` (text, nulável) — URL do áudio regenerado
- `voz_id` (text) — voz ElevenLabs da obra (padrão Sarah `EXAVITQu4vr4xnSDxMaL`)
- `updated_at` (timestamp)

Como a página é aberta por link secreto, o acesso será feito por server functions usando o cliente admin (sem expor service role ao navegador). A tabela terá RLS habilitada sem políticas para `anon`/`authenticated` — toda leitura/escrita passa pelas server functions.

### 3. Storage
Bucket público `audios-obras` para guardar os MP3 regenerados.

### 4. Segredo
A `ELEVENLABS_API_KEY` já existe no projeto e será usada nas server functions de TTS.

### 5. Server functions (`src/lib/admin-obras.functions.ts`)
- `listarOverrides` — retorna os overrides salvos (texto/áudio/voz por obra).
- `salvarTexto` — valida e grava `descricao` da obra.
- `regenerarAudio` — recebe `num`; lê o texto atual (override ou estático), chama ElevenLabs com a voz da obra, faz upload no Storage e grava a `audio_url`. Bloqueia a obra 2.

Validação de entrada com Zod (número 1–85, texto com limite de tamanho).

### 6. Página `/admin` (`src/routes/admin.tsx`)
- Lista com busca por número/título.
- Por obra: `textarea` para editar o texto, botão **Salvar texto**, player do áudio atual e botão **Regenerar áudio** (com estado de carregando). Obra 2 mostra aviso "áudio especial preservado".
- `head()` com `noindex` para não ser indexada por buscadores.

### 7. Integrar overrides na página pública
Ajustar `src/routes/obras.$num.tsx` para, via server fn, buscar o override da obra e usar `descricao`/`audio` salvos quando existirem, mantendo o conteúdo estático de `obras.ts` como fallback.

## Detalhes técnicos
- Voz original por obra: as demais obras usaram Sarah (suave); fica como padrão em `voz_id`, editável no banco se necessário. A obra 2 não é regenerada.
- TTS: modelo `eleven_multilingual_v2`, `output_format=mp3_44100_128`, settings de narração (stability ~0.6, similarity_boost 0.75).
- Upload do MP3 no bucket `audios-obras` com nome `obra-{num}-{timestamp}.mp3` para evitar cache antigo.
- Server functions usam `supabaseAdmin` apenas dentro do `.handler()` (sem vazar para o cliente).
- A página `/admin` não recebe link na navegação do site; só acessível por quem souber o endereço.

## Fora do escopo
- Edição dos demais campos (título, ano, técnica) — apenas texto e áudio.
- Login/autenticação (acesso por link secreto, conforme escolhido).
- Regeneração da obra 2.
