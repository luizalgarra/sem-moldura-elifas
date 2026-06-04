## Objetivo

Incluir a marca **CAIXA CULTURAL** à esquerda da marca Elifas Andreato no cabeçalho do site.

## Contexto

O cabeçalho (`src/components/SiteHeader.tsx`) atualmente exibe apenas o logo Elifas (`marca.logoFirmaBranco`) dentro de um `<Link>` para a página inicial. O selo `marca.seloCaixaCultural` já existe nos assets do projeto e está pronto para uso.

## Mudança

No `src/components/SiteHeader.tsx`, adicionar a imagem do selo CAIXA CULTURAL imediatamente à esquerda da marca Elifas, dentro do mesmo bloco do cabeçalho:

```text
[ CAIXA CULTURAL ] | [ Logo Elifas ]   Além da Moldura · 80 anos
```

Detalhes:

- Inserir `<img src={marca.seloCaixaCultural} alt="Caixa Cultural" />` à esquerda do logo Elifas.
- Dimensionar com altura compatível (`h-9 sm:h-11`, igual à marca Elifas) e `w-auto`.
- Adicionar um separador visual sutil (ex.: borda à direita do selo CAIXA com leve padding/margin) para distinguir as duas marcas — opcional, a confirmar visualmente.
- Manter o `<Link to="/">` envolvendo apenas a marca Elifas, deixando o selo CAIXA como elemento estático ao lado (já que é uma marca de patrocinador, não um link de navegação).

## Verificação

Conferir no preview que ambas as marcas aparecem alinhadas verticalmente, com tamanho equilibrado, e que o layout permanece responsivo em telas pequenas.   
  
  
INclua a palavra APRESENTA logo em seguida, antes do logo Elifas  


&nbsp;