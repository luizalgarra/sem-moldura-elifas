## Objetivo

Adicionar à página `/obras` uma navegação por **abas (Tipo)** combinada com **filtros (Função e Período)**, mantendo a busca atual e o agrupamento por parede como visão alternativa. Tudo no frontend — os dados de categoria são derivados das obras existentes, sem mudança de banco.

## Como as categorias são derivadas

As obras não têm campos "tipo/função/período" no banco. Em vez de migração, crio um módulo de classificação que deriva tudo de `tecnica`, `ano` e `titulo`.

**Tipo** (a partir de `tecnica`, com tabela de normalização para a grafia inconsistente da planilha — "plapis", "lapis/lápis", "acriloica"):
- Pinturas · Ilustração gráfica · Colagens & recortes · Madeira · Fotografia & mídia mista · Audiovisual

**Período** (a partir dos 4 primeiros dígitos de `ano`):
- 1960–70 · Anos 1980 · 1990–2000 · 2010+ · (Sem data)

**Função** (heurística por palavras-chave no `titulo` + técnica audiovisual, com um mapa manual de exceções para casos conhecidos):
- MPB / Capas de disco · Imprensa & editorial · Cartazes & teatro · Arte autoral · Audiovisual
- Quando nenhuma regra casar, cai em "Arte autoral" como padrão.

## Plano de implementação

### 1. `src/lib/categorias.ts` (novo)
- `type Tipo`, `type Funcao`, `type Periodo` + listas ordenadas com rótulos.
- `normalizarTecnica(t)` → tabela de mapeamento técnica→Tipo.
- `tipoDaObra(obra)`, `periodoDaObra(obra)`, `funcaoDaObra(obra)` recebendo `ObraAcervo`.
- `MAPA_FUNCAO_EXCECOES: Record<number, Funcao>` para sobrescrever obras específicas onde a heurística erra.
- Helper `classificar(obra)` que retorna `{ tipo, funcao, periodo }`.

### 2. `src/routes/obras.index.tsx` (editar)
- Adicionar `validateSearch` (zod + `fallback`) com `tipo`, `funcao`, `periodo` (cada um aceitando `"todos"` como padrão) e manter `busca` se desejado em URL.
- **Abas (Tipo)**: barra de abas no topo — "Todos" + um por Tipo, com contagem por aba. Selecionar aba atualiza `search.tipo`.
- **Filtros (Função e Período)**: dois grupos de chips/selects abaixo das abas, atualizando `search.funcao` / `search.periodo`. Botão "Limpar filtros" quando algo estiver ativo.
- Aplicar os filtros sobre `listarAcervo()` antes do agrupamento.
- **Resultado**: manter o agrupamento por parede como layout dos cards (já existente), agora exibindo só as obras filtradas; cabeçalho mostra o total filtrado.
- Preservar a caixa "Linha do Tempo" e a busca textual já existentes.

### 3. Acessibilidade e UX
- Abas com `role="tablist"`/`aria-selected`; filtros com `aria-pressed`; `role="status"` anunciando a contagem.
- Estado vazio ("Nenhuma obra para esta combinação") com ação de limpar filtros.

## Detalhes técnicos

- Sem alterações de banco nem de funções de servidor; classificação 100% client-side a partir de `ObraAcervo`.
- Estado dos filtros vive nos **search params** (compartilhável por URL, SSR-friendly) usando `zodValidator` + `fallback`.
- A tabela de normalização de técnica e o mapa de exceções de função ficam centralizados em `categorias.ts` para ajuste fácil de curadoria.

## Fora de escopo (pode ser próxima etapa)
- Persistir categorias no banco / editá-las pela tela `/editar`.
- Filtros nas telas `/admin` e `/editar`.
