## Diagnóstico

O número exibido no acervo e em `/obras/N` **não** é o identificador interno da obra (`chave`), e sim a **posição** dela na tabela de ordenação `acervo_ordem` — renumerada de 1 em diante, só com as obras visíveis. Minha troca anterior mexeu no lugar errado (conteúdo estático, imagem, áudio e flag de "oculta" das chaves 83/89), o que por coincidência deixou o resultado visual idêntico. Por isso pareceu que "nada trocou".

Hoje:
- **Posição #83** → mostra "Encarte Cavaquinho, Paulinho da viola" (Parede 3)
- **Posição #89** → mostra "Passaros, Paulinho da viola" (Parede 3)

Objetivo: inverter essas duas, **mantendo as duas visíveis** — #83 passa a "Passaros" e #89 passa a "Encarte Cavaquinho".

## Etapas

### 1. Desfazer minhas alterações anteriores (voltar ao estado original limpo)
- `src/data/obras.ts`: devolver o conteúdo estático das entradas 83 e 89 ao original (Passaros em 83, Pirotecnico em 89).
- `src/assets/`: trocar de volta os ponteiros `obra-83`/`obra-89` (`.jpg` e `.mp3`).
- Banco: reverter as três trocas feitas — `obra_overrides` (volta para num 83), `obras_ocultas` (volta para 89) e `acervo_ordem` (a chave volta a 83).

Isso restaura exatamente o estado anterior, sem perdas.

### 2. Trocar de fato as duas posições (a correção certa)
Na tabela `acervo_ordem`, inverter qual `chave` ocupa cada posição:
- posição 83 ⇄ posição 89

Como ambas as obras são visíveis e o número exibido é a posição, isso troca o que aparece em #83 e #89 — sem ocultar nenhuma e sem mexer em conteúdo, imagem ou áudio.

```text
-- swap das chaves entre as posições 83 e 89 (com valor temporário)
posicao 83  -> chave que estava na 89
posicao 89  -> chave que estava na 83
```

### 3. Conferência
- Validar build.
- Abrir o acervo e confirmar: **#83 = "Passaros"** e **#89 = "Encarte Cavaquinho"**, ambas visíveis, na ordem trocada.
- Lembrar que `/obras/83` pode estar em cache do navegador; conferir com recarga forçada.

## Riscos
- Operação simétrica e reversível; mexe apenas na ordenação. Nenhum texto, imagem ou áudio é alterado ou perdido.
