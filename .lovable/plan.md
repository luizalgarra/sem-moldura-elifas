# Importar as imagens das obras novas (86–116) a partir da planilha

As imagens **estão embutidas** na planilha `LISTA DE OBRAS - ELIFAS 2.xlsx` (118 imagens dentro do arquivo). O motivo de aparecer "Imagem em breve" é que os arquivos `obra-86.jpg` … `obra-116.jpg` ainda não existem em `src/assets/obras/`.

Ponto importante descoberto: **a ordem da planilha NÃO é a mesma da numeração do site**. Ex.: obra 1 do site é "Secos e Molhados, Opinião", mas a linha 1 da planilha é "7 Dias de Agonia". Por isso o casamento será feito **por título**, garantindo que cada obra receba a imagem correta.

## O que será feito

1. Extrair as 31 imagens embutidas correspondentes às obras 86–116 (casadas por título com as linhas da planilha).
2. Converter cada PNG para JPG (mesmo padrão das obras 1–85).
3. Subir cada imagem como Lovable Asset com o nome `obra-{num}.jpg`, gerando os arquivos `src/assets/obras/obra-86.jpg.asset.json` … `obra-116.jpg.asset.json`.

Nenhuma alteração de código é necessária — `imagemDaObra(num)` passa a encontrar o arquivo automaticamente e a imagem aparece.

## Mapeamento obra → imagem da planilha (casado por título)

```text
86 Arca de Noé 2                  → image8       101 Pixinguinha               → image84
87 Brasil História                → image17      102 Video1, Almanaque         → image99
88 Calunga                        → image20      103 Video 2, Arca de Noé      → image100
89 Legiao Estrangeira             → image25      104 Video 3, Bandalhismo       → image101
90 Movimento                      → image26      105 Video 4, Bebadosamba       → image102
91 Encarte disco Paulinho da Viola→ image27      106 Video 5, Cavaquinho        → image103
92 Samba de Dandara               → image42      107 Video 6, Clara Nunes       → image104
93 Fatima Guedes, Caderno         → image47      108 Video 7, Clementina        → image105
94 Fatima Guedes, Lapis de Cor    → image48      109 Video 8, Zeca Pagodinho    → image106
95 Mao, Movimento                 → image66      110 Video 9, Opera do Malandro → image107
96 Muro de Arrimo                 → image68      111 Video 10, João Nogueira    → image108
97 Dom Paulo, Opinião             → image73      112 Video 11, Tendinha         → image109
98 O Processo                     → image74      113 Video 12, Terreiro...      → image110
99 Papai Noel                     → image76      114 Video 13, Traço de União   → image111
100 Nervos de Aço                 → image78      115 Gabriela                   → image112
                                                 116 Shapes 5 unidades          → image117
```

As 31 obras têm imagem correspondente — inclusive os "vídeos", que na planilha são capas/imagens estáticas, então funcionam como imagem normal do card.

## Detalhes técnicos

- Extração via `unzip`/Python a partir de `xl/media/` + `xl/drawings/drawing1.xml` (âncoras das imagens nas linhas).
- Conversão PNG→JPG com ImageMagick (`nix run nixpkgs#imagemagick`).
- Upload com `lovable-assets create --file <jpg> --filename obra-{num}.jpg`, salvando a saída em `src/assets/obras/obra-{num}.jpg.asset.json`.
- Sem mudança em `src/data/obras.ts` nem em componentes.

## Observações

- Áudios das obras novas continuam sem arquivo (a planilha só traz imagens); os cards seguem sem áudio até serem fornecidos.
- Caso queira, posso depois revisar também se alguma das imagens 1–85 está trocada, mas isso está fora do escopo deste pedido.
