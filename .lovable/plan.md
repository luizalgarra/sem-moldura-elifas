## Objetivo

Dar mais destaque visual ao link "↗ Veja na linha do tempo" que aparece na ficha de cada obra do acervo (`src/routes/obras.$num.tsx`), para que o visitante perceba e use a conexão com as Linhas da Vida.

## O que muda

Apenas estilo/apresentação do bloco do link já existente — sem alterar a lógica de correspondência (`marcoDaObra`) nem dados.

Mudanças propostas no bloco `{corresp && (...)}`:

- **Cor de marca / contraste**: trocar o atual cartão neutro (`bg-card` + borda discreta) por um bloco em destaque usando o âmbar de acento (`bg-accent text-accent-foreground`), padrão de chamada de ação do site.
- **Hierarquia**: adicionar um rótulo curto acima do link (ex.: "Conexão com a história") e aumentar levemente o peso/tamanho da fonte do link principal.
- **Ícone**: substituir a seta textual `↗` por um ícone consistente do `lucide-react` (ex.: `History` ou `ArrowUpRight`) já usado no projeto.
- **Espaçamento/posição**: manter logo após a ficha técnica, com `mt-6` e largura total no mobile, mantendo área de toque acessível (min 44px).
- **Foco/hover**: garantir estados de hover e foco visíveis coerentes com o tema.

## Arquivo afetado

- `src/routes/obras.$num.tsx` — apenas o JSX/classes do bloco `corresp`.

## Fora de escopo

Lógica de datas, dados (`timeline.ts`, `anos.ts`), e a página Linhas da Vida permanecem inalterados.