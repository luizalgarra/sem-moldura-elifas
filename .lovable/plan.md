## Objetivo

Adicionar uma barra de filtros completa na página **Editar**, complementando a busca por número/título que já existe. Os filtros pedidos: **por parede**, **por tipo** (fixa/nova), **com/sem imagem**, **com/sem áudio** e **com/sem descrição**.

## Comportamento

A barra de filtros fica logo abaixo do campo de busca, dentro do mesmo cabeçalho fixo (sticky). Todos os filtros se combinam com a busca e entre si (AND). Um botão "Limpar filtros" aparece quando algum filtro está ativo, e mostramos a contagem de resultados.

Cada filtro é um seletor com 3 estados:

```text
Parede:     [ Todas ▾ ]   (lista de paredes existentes no acervo)
Tipo:       [ Todos | Fixas | Novas ]
Imagem:     [ Todos | Com  | Sem ]
Áudio:      [ Todos | Com  | Sem ]
Descrição:  [ Todos | Com  | Sem ]
```

- **Parede**: dropdown montado dinamicamente a partir das paredes presentes no acervo (valores únicos de `obra.parede`, ordenados), mais a opção "Todas".
- **Tipo**: usa `obra.extra` (true = Nova, false = Fixa).
- **Imagem**: usa presença de `obra.imagem`.
- **Áudio**: usa presença de `obra.audio`.
- **Descrição**: usa `obra.descricao` não-vazia.

## Implementação técnica

Tudo em `src/routes/editar.tsx` (apenas frontend — nenhuma mudança de backend, server function ou migração):

1. Adicionar estados de filtro no componente `EditarPagina`:
   - `paredeFiltro: string` ("" = todas)
   - `tipoFiltro: "todos" | "fixa" | "nova"`
   - `imagemFiltro: "todos" | "com" | "sem"`
   - `audioFiltro: "todos" | "com" | "sem"`
   - `descricaoFiltro: "todos" | "com" | "sem"`

2. Derivar a lista de paredes únicas via `useMemo` sobre `acervo`.

3. Estender o `useMemo` `filtradas` para aplicar busca + todos os filtros em sequência.

4. Renderizar a barra de filtros dentro do bloco sticky existente. Para os filtros tri-estado, usar pequenos grupos de botões (toggle) estilizados com tokens do design system; para parede, usar o componente `Select` do shadcn (ou um `<select>` estilizado se o Select ainda não estiver no projeto — verifico antes).

5. Adicionar linha com "N resultados" + botão "Limpar filtros" (reseta todos os estados e a busca).

Nenhum dado novo é necessário: todos os campos (`parede`, `extra`, `imagem`, `audio`, `descricao`) já vêm de `listarAcervo`.
