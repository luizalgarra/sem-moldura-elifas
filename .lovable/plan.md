## Objetivo
Cruzar os anos das obras do Acervo com os marcos das **Linhas da Vida** e criar links nos dois sentidos, aproximando ao marco mais próximo quando o ano exato não existir na linha do tempo.

## Lógica de correspondência (compartilhada)
Criar um utilitário em `src/lib/anos.ts`:
- `extrairAno(ano: string): number | null` — extrai o primeiro número de 4 dígitos (cobre "1974", "Década 1980" → 1980, "2000").
- `marcoMaisProximo(ano: number, anosMarcos: number[]): number` — retorna o ano de marco com menor distância (desempate pelo mais antigo).
- Lista dos anos de marco derivada de uma fonte única.

Para isso, extrair o array `marcos` de `linhas-da-vida.tsx` para `src/data/timeline.ts` (exportando `marcos` e `anosMarcos`), e a página passa a importar de lá. Sem mudança visual na linha do tempo.

## Sentido 1 — Obra → Linha do tempo
Em `src/routes/obras.$num.tsx`:
- Calcular o marco correspondente ao `obra.ano` (exato ou mais próximo).
- Abaixo da ficha técnica, adicionar um bloco discreto no padrão do site: um `<Link>` para `/linhas-da-vida` com `hash` no ano do marco (ex.: `#ano-1974`), com rótulo como "Veja 1974 na linha do tempo" (e, quando aproximado, "Contexto da década na linha do tempo — 1980").

## Sentido 2 — Linha do tempo → Obras
Em `src/routes/linhas-da-vida.tsx`:
- Adicionar `loader` chamando `listarAcervo()` e agrupar as obras por marco (cada obra cai no marco exato ou mais próximo).
- Dar `id="ano-<ano>"` e `scroll-mt-24` a cada item da timeline, para os links âncora funcionarem.
- Em cada marco que tiver obras associadas, renderizar uma lista de chips/links "Obras relacionadas" apontando para `/obras/$num` (usando o `num` exibido vindo do acervo), no padrão visual do site.

## Detalhes técnicos
- Apenas frontend/apresentação; nenhuma alteração de schema ou de áudio/imagem.
- Navegação com `<Link to=... params=... hash=...>` (nunca `<a href>`), conforme TanStack Router.
- `extrairAno`/`marcoMaisProximo` cobrem anos fora da linha (2000, 2006, 2010) aproximando ao marco mais próximo.
- `routeTree.gen.ts` é gerado automaticamente; não será editado à mão.

## Arquivos afetados
- `src/data/timeline.ts` (novo — dados dos marcos)
- `src/lib/anos.ts` (novo — utilitários de correspondência)
- `src/routes/linhas-da-vida.tsx` (loader + âncoras + obras relacionadas)
- `src/routes/obras.$num.tsx` (link para a linha do tempo)