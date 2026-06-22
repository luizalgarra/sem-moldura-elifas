## Objetivo

Fazer a tela **/admin** exibir exatamente a mesma lista de obras que **/editar**: mesmo conjunto (ocultas removidas, obras novas incluídas), mesma ordem e mesma numeração contígua (1..N), com o status completo (texto / locução / aprovada) funcionando inclusive para as obras novas.

## Causa atual

- `/editar` monta a lista via `listarAcervo → construirAcervo` (fixas − ocultas + extras, renumeradas por `acervo_ordem`).
- `/admin` monta a lista a partir do array estático `@/data/obras` cruzado com `listarOverrides`, então mostra as ocultas, não mostra as novas e usa o número original.

## Mudanças

### 1. Banco (migração)
- Adicionar a coluna `aprovada boolean not null default false` em `public.obras_extras`, para que as obras novas também possam ter status "Aprovada" (hoje só `obra_overrides` tem essa coluna). Sem novas GRANTs (tabela já existe e já tem privilégios).

### 2. Camada de servidor (`src/lib/admin-obras.functions.ts`)
- **Incluir `aprovada` no `construirAcervo`**: ler `aprovada` de `obra_overrides` (fixas) e de `obras_extras` (extras) e expor um campo `aprovada` em cada item; também expor a `chave` interna (já existe) e os caminhos/flags necessários ao status (`audiodescricao`, `audioFem`).
- **Novo server function `listarAcervoAdmin`** (`GET`, `requireSupabaseAuth` + `garantirAdmin`): retorna a lista canônica de `construirAcervo`, já com `chave`, `num` (posição exibida), `titulo`, `parede`, `descricao`, `audiodescricao`, `audioFem`, `updatedAt` e `aprovada`. É a fonte única da tela admin (substitui `obras` estático + `listarOverrides`).
- **Corrigir `definirAprovacao`**: hoje grava sempre em `obra_overrides` por `num`. Passar a rotear para a tabela correta conforme `ehObraFixa(chave)` (igual aos outros saves), gravando `aprovada` em `obras_extras` quando a obra for nova.

### 3. Tela `/admin` (`src/routes/admin.tsx`)
- Trocar a fonte de dados: consumir `listarAcervoAdmin` (via `useQuery` + `useServerFn`) em vez de `import { obras }` + `listarOverrides`.
- Derivar o status de cada item a partir do próprio registro normalizado (`aprovada` → `audioFem` → `audiodescricao` → sem gerar), eliminando o mapa de overrides.
- **Chavear todas as ações por `chave`** (não pela posição): `regenerarAudio`, `salvarTexto`, `salvarAudiodescricao`, `gerarTextoDescricao`, `definirAprovacao`, `listarVersoes`, restaurar versões — todas recebem `chave`. Exibir `num` (posição) apenas como rótulo visual.
- Ajustar `ObraEditor` para receber `chave` (para as ações) e `num` (para exibição), além dos campos de texto/áudio/aprovação vindos do registro unificado.
- Atualizar contadores dos filtros e a geração em lote para iterar a lista unificada (por `chave`).

## Resultado

As duas telas passam a refletir o mesmo acervo, na mesma ordem e numeração; obras novas aparecem no /admin com status real e podem ser aprovadas; obras ocultas deixam de aparecer no /admin.

## Observações técnicas
- `listarAcervo` (pública, usada nos loaders SSR de rotas públicas) permanece sem middleware. A versão admin é separada e protegida.
- Nenhuma alteração em chaves/segredos; toda escrita continua protegida por `requireSupabaseAuth` + `garantirAdmin`.