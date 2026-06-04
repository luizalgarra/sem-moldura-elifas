## Objetivo

Regerar a planilha do acervo (a partir do `elifas_80_anos_acervo_atual_v2.xlsx`) preenchendo a coluna **"Arquivo de imagem"** (coluna E) nas células em branco das linhas de **vídeos** e de **shapes**, preservando todo o restante (imagens embutidas, fórmulas, alturas de linha, aba Resumo).

## Base de partida

- Arquivo: `/mnt/documents/elifas_80_anos_acervo_atual_v2.xlsx`
- Saída versionada: `/mnt/documents/elifas_80_anos_acervo_atual_v3.xlsx` (preserva o v2)

## Preenchimentos

### Vídeos (linhas 92–102 da aba Consolidado, coluna E em branco)

Gerar o nome do arquivo a partir do título, com extensão `.mp4`. Regra:
remover vírgulas, substituir espaços por `_`, preservar acentos.

```text
Video1, Almanaque              -> Video1_Almanaque.mp4
Video 2, Arca de Noé           -> Video_2_Arca_de_Noé.mp4
Video 3, Bandalhismo           -> Video_3_Bandalhismo.mp4
Video 4, Bebadosamba           -> Video_4_Bebadosamba.mp4
Video 5, Cavaquinho            -> Video_5_Cavaquinho.mp4
Video 6, Clara Nunes           -> Video_6_Clara_Nunes.mp4
Video 7, Clementina            -> Video_7_Clementina.mp4
Video 8, Zeca Pagodinho        -> Video_8_Zeca_Pagodinho.mp4
Video 9, Opera do Malandro     -> Video_9_Opera_do_Malandro.mp4
Video 10, João Nogueira        -> Video_10_João_Nogueira.mp4
Video 11, Tendinha             -> Video_11_Tendinha.mp4
```

As linhas 103 e 104 (Video 12 e 13) já têm arquivo de imagem associado — não serão alteradas.

### Shapes (Parede 4, coluna E em branco)

```text
Linha 105 (Nº impr. 102) "Shapes 5 unidades"  -> permanece em branco
Linha 106 (Nº impr. 103) "Shape 1 Batuqueiro" -> Shape_1_Batuqueiro.png
Linha 107 (Nº impr. 104) "Shape 2 Cantora"    -> Shape_2_Cantora.png
Linha 108 (Nº impr. 105) "Shape 3 Guitarrista"-> Shape_3_Guitarrista.png
Linha 109 (Nº impr. 106) "Shape 4 Conjunto"   -> Shape_4_Conjunto.png
Linha 110 (Nº impr. 107) "Shape 5 Listas"     -> Shape_5_Listas.png
```

## Detalhes técnicos

1. Carregar o `v2` com `openpyxl` (mantendo fórmulas, imagens e formatação).
2. Escrever apenas nas células em branco da coluna E das linhas listadas, aplicando a mesma fonte/estilo das demais células de "Arquivo de imagem".
3. Salvar como `v3`.
4. Recalcular fórmulas com o script de recalculo (LibreOffice) e verificar ausência de erros.
5. **QA**: converter a aba Consolidado em imagem e inspecionar visualmente as linhas de vídeos e shapes para confirmar que os nomes aparecem corretos e nada foi deslocado; corrigir e repetir se necessário.

## Entrega

`elifas_80_anos_acervo_atual_v3.xlsx` disponibilizado para download via artifact.