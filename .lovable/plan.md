# Histórico de versões das gerações (texto e áudio)

Guardar as **últimas 3** versões por obra, tanto de **texto** quanto de **áudio**, registrando **gerações da IA e salvamentos manuais**, com opção de **restaurar** qualquer versão.

## 1. Banco de dados (migração)

Nova tabela `public.obra_versoes`:

```text
id          uuid  pk  default gen_random_uuid()
num         int   not null            -- número da obra
tipo        text  not null            -- 'texto' | 'audio'
origem      text  not null            -- 'ia' | 'manual'
descricao   text                      -- preenchido quando tipo = 'texto'
audio_path  text                      -- caminho no storage quando tipo = 'audio'
created_at  timestamptz not null default now()
```

- GRANTs: `SELECT, INSERT, DELETE` para `authenticated`; `ALL` para `service_role` (sem `anon` — é área admin).
- RLS habilitada; políticas usando a função existente `is_admin()` para leitura. As escritas reais vêm de server functions com `supabaseAdmin`, então as políticas servem de proteção da Data API.
- Índice em `(num, tipo, created_at desc)` para listar rápido.

## 2. Server functions (`src/lib/admin-obras.functions.ts`)

**Helper interno `registrarVersao(supabaseAdmin, { num, tipo, origem, descricao?, audioPath? })`:**
1. Insere a nova versão.
2. Mantém só as 3 mais recentes daquele `(num, tipo)`: busca as excedentes e as apaga.
3. Para versões de **áudio** podadas, apaga também o arquivo correspondente do bucket `audios-obras` (os 3 mais recentes incluem sempre o áudio atual, então a poda nunca remove o arquivo em uso).

**Pontos onde registrar (origem "Ambos"):**
- `gerarTextoDescricao` → ao gerar com sucesso, registra versão `tipo='texto', origem='ia'` (mesmo antes de salvar, como o usuário pediu).
- `salvarTexto` → registra versão `tipo='texto', origem='manual'`.
- `regenerarAudio` → após salvar o `audio_fem_path`, registra versão `tipo='audio', origem='ia'` com o `audio_path` gerado.

**Novas funções expostas:**
- `listarVersoes({ chave })` → devolve as últimas 3 de texto e as últimas 3 de áudio (data, origem, prévia do texto / caminho do áudio).
- `restaurarVersaoTexto({ id })` → carrega a versão, faz `upsert` da `descricao` na tabela da obra (`obra_overrides`/`obras_extras`) e retorna o texto restaurado.
- `restaurarVersaoAudio({ id })` → faz `upsert` do `audio_fem_path` com o caminho da versão escolhida, retornando nova `versao` para atualizar o player.

Todas com `requireSupabaseAuth` + checagem `ehAdmin`, no mesmo padrão das demais.

## 3. Interface (`src/routes/admin.tsx`)

No card de cada obra, abaixo dos controles atuais:
- Seção recolhível **"Histórico"** que chama `listarVersoes` ao abrir.
- Lista de **texto** (até 3): data/hora, etiqueta de origem (IA / manual), trecho do texto e botão **Restaurar** → preenche o textarea com o texto restaurado.
- Lista de **áudio** (até 3): data/hora, origem, mini player de prévia e botão **Restaurar** → atualiza o áudio atual e recarrega o player.
- Após restaurar, recarrega o histórico e chama `onChanged()`.

## Observações técnicas

- Sem novos segredos, sem mudança no fluxo de revisão/salvamento já existente.
- Áudio: nenhum upload novo na restauração — apenas reaponta o `audio_fem_path` para um arquivo já existente no storage.
- Limite fixo de 3 por tipo/obra mantém o storage enxuto (a poda apaga os arquivos de áudio antigos automaticamente).
