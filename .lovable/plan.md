## Objetivo

Trocar de lugar as obras **#83 "Passaros, Paulinho da viola"** (Parede 3) e **#89 "Pirotecnico Zacarias"** (Parede 2). Cada obra leva consigo **todo o conteúdo**: ficha (título, ano, técnica, dimensão, parede, descrição), imagem, áudio e quaisquer edições feitas no painel. Após a troca:

- **#83** passa a ser "Pirotecnico Zacarias" (Parede 2)
- **#89** passa a ser "Passaros, Paulinho da viola" (Parede 3)

## Etapas

### 1. Catálogo estático (`src/data/obras.ts`)
Trocar o conteúdo das duas entradas (mantendo `num: 83` e `num: 89` em suas posições), de modo que a obra #83 receba os dados de Pirotecnico e a #89 receba os dados de Passaros. As chamadas `imagemDaObra(num)` / `audioDaObra(num)` seguem o número — então a mídia acompanha via etapa 2.

### 2. Ponteiros de mídia (`src/assets/`)
Trocar os arquivos de ponteiro entre os dois números, via cópia segura com nome temporário para evitar colisão:
- `src/assets/obras/obra-83.jpg.asset.json` ⇄ `obra-89.jpg.asset.json`
- `src/assets/audio/obra-83.mp3.asset.json` ⇄ `obra-89.mp3.asset.json`

Assim a imagem/áudio de cada obra continua correta após a renumeração.

### 3. Banco de dados (troca dos registros)
Aplicar a troca 83⇄89 (usando valor temporário para não violar a chave) em:
- **`obra_overrides`** — a edição de texto que existe hoje em #83 passa a apontar para #89 (acompanha "Passaros").
- **`obras_ocultas`** — o item oculto hoje em #89 passa a #83 (acompanha "Pirotecnico", que continua oculto/duplicado).
- **`acervo_ordem`** — a chave 83 vira 89 para preservar a posição manual de ordenação da obra que se move.

### 4. Conferência
- Validar build.
- Abrir o acervo e a ficha de #83 (deve mostrar Pirotecnico Zacarias, Parede 2, imagem/áudio corretos) e de #89 (Passaros, Parede 3).
- Confirmar que o estado de "oculta" e a edição de texto seguiram corretamente.

## Detalhes técnicos

A troca no banco é feita com offset temporário, por exemplo:
```text
UPDATE ... SET num = -83 WHERE num = 83;
UPDATE ... SET num = 83  WHERE num = 89;
UPDATE ... SET num = 89  WHERE num = -83;
```
(o mesmo padrão para `chave` em `acervo_ordem`).

## Riscos
- Operação simétrica e reversível; a única obra com edição de texto no banco é a #83 atual, que será corretamente reapontada. Nada é perdido.
