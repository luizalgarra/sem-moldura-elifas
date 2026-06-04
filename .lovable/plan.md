## Objetivo

Ajustar a planilha `elifas_80_anos_acervo_atual.xlsx` para que **todas as 82 miniaturas** caibam perfeitamente nas suas células, sem cortes nem sobreposição.

## Situação atual

- Aba **Consolidado**: 82 imagens ancoradas na coluna de imagem (coluna B), cada uma com ~150px de altura e largura variando entre ~107 e 150px.
- As linhas/coluna atuais não têm tamanho garantido para conter as imagens, causando cortes ou sobreposição com texto.

## O que será feito

1. Carregar a planilha com `openpyxl` preservando todo o conteúdo, fórmulas e formatação.
2. **Largura da coluna de imagem**: definir largura suficiente para a maior miniatura (≈150px → ~22 unidades de largura do Excel), com pequena margem lateral.
3. **Altura das linhas de dados**: para cada linha que contém imagem, definir a altura em pontos correspondente a 150px (~113 pt) mais uma pequena margem, garantindo que a miniatura completa apareça.
4. Manter as linhas de cabeçalho e a aba "Resumo & Notas" inalteradas.
5. Reposicionar/centralizar as imagens dentro das células se necessário, para alinhamento limpo.
6. Salvar como **novo arquivo versionado** (`elifas_80_anos_acervo_atual_v2.xlsx`) para preservar o original.
7. **QA**: converter a aba Consolidado em imagem e inspecionar visualmente que todas as miniaturas cabem corretamente, sem cortes nem texto sobreposto; corrigir e repetir se necessário.

## Entrega

Arquivo final disponibilizado para download via artifact.
