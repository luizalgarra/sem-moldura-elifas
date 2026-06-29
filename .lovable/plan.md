# Realçar as capas esmaecidas em /obras

## Contexto
As miniaturas em `/obras` não têm nenhum filtro de CSS — o "esmaecido" vem das próprias imagens de origem, que em vários casos são scans de baixa saturação (quase em tons de cinza). A 97 e a 100 parecem vivas porque seus arquivos já são coloridos. Como você escolheu **realce visual por CSS**, vamos aplicar um leve ajuste de imagem nas miniaturas para uniformizar e dar mais vida ao conjunto.

> Observação honesta: o filtro CSS aumenta saturação/contraste/brilho do que já existe. Imagens praticamente em preto-e-branco vão ficar um pouco mais nítidas e contrastadas, mas **não ganham cor que não está no arquivo**. Para essas, só a substituição da imagem resolveria de fato.

## O que será feito

1. **Criar uma utility de realce** em `src/styles.css` (Tailwind v4 `@utility`), por exemplo `img-realce`, aplicando algo como `filter: saturate(1.18) contrast(1.06) brightness(1.03)` com uma transição suave.

2. **Aplicar nas miniaturas**:
   - `src/components/ObraCard.tsx` — na `<img>` da grade.
   - `src/components/ObraLinha.tsx` — na `<img>` da lista.
   - O realce fica **apenas nas miniaturas do acervo**; a imagem grande na página da obra (`/obras/$num`) não é alterada, para preservar a fidelidade ao ver a obra em detalhe.

3. **Preservar o hover existente**: na grade já há `group-hover:scale-[1.03]`. O filtro será combinado sem remover esse efeito (e opcionalmente um leve aumento extra de saturação no hover).

## Detalhes técnicos
- A utility será definida no nível superior de `src/styles.css` com `@utility img-realce { ... }` (padrão Tailwind v4 — nada de `tailwind.config`).
- Valores conservadores para evitar cores "estouradas" nas obras que já são vivas (97, 100). Posso ajustar a intensidade depois que você ver o resultado.

## Validação
- Conferir no preview a grade e a lista, comparando obras esmaecidas (ex.: 96, 99, 101) com as vivas (97, 100), garantindo que o conjunto fique mais homogêneo sem distorcer as coloridas.
