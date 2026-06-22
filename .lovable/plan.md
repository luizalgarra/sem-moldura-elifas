# Vídeos já gerados por obra

Quando uma obra já tem reels salvos, mostrar um botão (só para administradores) na página de gerar reels que leva à galeria `/postagens` já filtrada por aquela obra.

## O que muda para o usuário

- Na página de gerar reels da obra (`/postar/$num`), se já houver vídeos salvos daquela obra, aparece um botão como **"Ver 3 vídeos já gerados desta obra"**.
- Ao clicar, abre a página **Postagens** mostrando apenas os vídeos daquela obra, com reproduzir, baixar e excluir (como já funciona hoje).
- A página de Postagens filtrada exibe um aviso de filtro e um link **"Ver todas as postagens"**.
- O botão só aparece para administradores logados; visitantes comuns não o veem.

## Passos técnicos

### 1. `src/lib/admin-obras.functions.ts`
- `listarPostagens`: aceitar um filtro opcional `{ num?: number }` no `inputValidator`. Quando `num` vier, aplicar `.eq("num", num)` na consulta. Sem `num`, comportamento atual (lista tudo). Continua com `requireSupabaseAuth` + `garantirAdmin`.
- Adicionar `contarPostagensReels` (`createServerFn` POST, `requireSupabaseAuth` + `garantirAdmin`), recebendo `{ num }` e retornando `{ total: number }` via `select("id", { count: "exact", head: true })`. Usada para decidir se mostra o botão sem baixar URLs assinadas.

### 2. `src/routes/postar.$num.tsx` (ou dentro de `GeradorReels`)
- Usar `useAdminAuth()` para checar `isAdmin`.
- Quando admin, consultar `contarPostagensReels({ data: { num } })` via `useServerFn` + `useQuery`.
- Se `total > 0`, renderizar um botão/`Link` para `/postagens` com search param `obra` = num, rótulo "Ver N vídeos já gerados desta obra".
- Após salvar um novo reels (sucesso), invalidar a query da contagem para o número atualizar.

### 3. `src/routes/postagens.tsx`
- Declarar `validateSearch` para ler `obra?: number`.
- Passar o filtro para `listarPostagens` (`queryKey: ["postagens", obra]`, `queryFn: () => buscar(obra ? { data: { num: obra } } : undefined)`).
- Quando `obra` estiver definido, mostrar um aviso "Mostrando apenas a Obra N" e um `Link` "Ver todas as postagens" (para `/postagens` sem filtro).

## Observações
- `/postar` e `/postagens` já dependem de funções admin; a contagem e a listagem filtrada mantêm o padrão `requireSupabaseAuth` + `garantirAdmin`.
- Nenhuma mudança de banco de dados é necessária (a tabela `postagens_reels` já tem a coluna `num`).
