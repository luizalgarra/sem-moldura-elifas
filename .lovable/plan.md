# Filtro de status no painel Admin

Adicionar um filtro por status para controlar quais obras aparecem em `/admin`, mais um controle de aprovação manual.

## Status (derivados da presença de dados)

Cada obra recebe exatamente um status, na ordem de prioridade:

1. **APROVADA** — quando o campo `aprovada` do override estiver marcado.
2. **LOCUÇÃO GERADA** — existe `audio_fem_path` salvo (e não aprovada).
3. **TEXTO GERADO** — existe texto de audiodescrição salvo (`audiodescricao`), mas sem locução.
4. **SEM GERAR** — nenhum dos acima (apenas conteúdo estático).

## Comportamento do filtro

- Botões/abas exclusivos no topo: **Todas · Sem gerar · Texto gerado · Locução gerada · Aprovada**. Seleciona um por vez.
- Funciona **em conjunto** com o campo de busca por número/título já existente (busca + status aplicados juntos).
- Cada cartão de obra mostra um selo com seu status atual.

## Aprovação

- Botão **"Aprovar"** em cada obra (alterna para **"Desaprovar"** quando já aprovada).
- Persiste no banco via nova coluna `aprovada` em `obra_overrides`.

## Mudanças técnicas

### Banco (migração)
- Adicionar coluna `aprovada boolean not null default false` em `public.obra_overrides`.

### `src/lib/admin-obras.functions.ts`
- Incluir `aprovada` no `select` e no tipo `OverrideObra` (em `listarOverrides`).
- Nova server function `definirAprovacao` (`{ chave: number, aprovada: boolean }`, protegida por `garantirAdmin`) que faz upsert da coluna `aprovada` no override.

### `src/routes/admin.tsx`
- Helper `statusDaObra(override)` retornando `"sem-gerar" | "texto" | "locucao" | "aprovada"`.
- Estado `filtroStatus` + linha de botões de filtro (logo abaixo/junto da busca); `filtradas` passa a aplicar busca **e** status.
- Selo de status em cada `ObraEditor`.
- Botão **Aprovar/Desaprovar** em cada `ObraEditor`, chamando `definirAprovacao` e atualizando via `onChanged()`/`refetch()`.

Nenhuma alteração na lógica de geração de texto/locução já existente.
