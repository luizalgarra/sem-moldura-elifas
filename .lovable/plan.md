## Objetivo

Publicar uma nova página dedicada a **Laura Andreato** dentro da seção **O Instituto**, usando o texto fornecido sem marcações de revisão, e adicioná-la à navegação.

## Mudanças

### 1. Navegação — `src/data/navegacao.ts`
Adicionar um novo item ao grupo "O Instituto":
```
{ rotulo: "Laura Andreato", para: "/instituto/laura-andreato", descricao: "Curadoria, pesquisa e finalização do legado" }
```
Assim a página aparece no índice de `/instituto` (que lista `grupo.itens`) e no menu do site.

### 2. Nova rota — `src/routes/instituto.laura-andreato.tsx`
Arquivo no padrão das demais páginas da seção, usando o componente `PaginaArtigo` (`titulo` + `paragrafos`), com `createFileRoute("/instituto/laura-andreato")` e bloco `head()` de SEO (title, description, og:* e canonical auto-referente em `https://institutoelifasandreato.org.br/instituto/laura-andreato`).

O conteúdo será organizado em parágrafos a partir do texto fornecido (publicado como está, sem marcações):

- **Apresentação**: Laura Andreato (Laura Huzak Andreato), filha de Elifas Andreato — artista plástica, educadora e pesquisadora, formada em Artes Plásticas pela ECA-USP, com mestrado em Poéticas Visuais e doutorado em andamento; autora de *Pelos Olhos de Minha Mãe*.
- **Atuação no Instituto**: curadora adjunta, pesquisadora e finalizadora do legado visual da família, garantindo que a obra do pai permaneça viva e em circulação.
- **Finalização de obras póstumas**: acabamento visual (ilustrações e pinceladas digitais) do livro infantil inédito *Lábaro: O enigma da bandeira brasileira*.
- **Arqueologia e repatriação do acervo**: busca e negociação de obras dispersas, incluindo o contato com a compradora da ilustração de Geraldo Vandré encontrada por R$ 5 em um bazar, visando disponibilizá-la ao público e a estudantes no Centro Universitário Belas Artes.
- **Mediação de ações artísticas**: representação do Instituto em eventos e mediação de intervenções como a ação coletiva "Árvore da Vida", na Praça Memorial Vladimir Herzog, que retomou a mão vermelha desenhada por Elifas em sua época de operário para alertar sobre acidentes e mortes no trabalho.

**Meta description SEO** (até 160 caracteres): "Laura Andreato, filha de Elifas Andreato: curadora adjunta, pesquisadora e finalizadora do legado visual do artista no Instituto Elifas Andreato."

## Observações

- Nenhuma alteração em backend, dados de obras ou demais seções.
- O `routeTree.gen.ts` é gerado automaticamente; não será editado manualmente.
- Texto publicado conforme fornecido, aberto a revisão curatorial posterior.
