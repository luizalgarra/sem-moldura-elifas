# Sincronizar o acervo com a planilha

Trazer o site (`src/data/obras.ts`) para o mesmo conjunto da planilha `LISTA DE OBRAS - ELIFAS 2`, conforme as três decisões:

1. **Vídeos entram** no acervo (os 14 audiovisuais de 2015).
2. **Nova parede** agrupa todas as obras que hoje não têm parede definida (as 31 novas).
3. **Gravar a entrada 112 sobre a obra 68** (resolver a divergência do "Aqualouco").

## O que será feito

### 1. Adicionar as 31 obras faltantes
Cada item ausente vira uma nova entrada em `obras`, com numeração sequencial nova (a partir de **86**), preenchendo os campos disponíveis na planilha (título, ano, autor, técnica, dimensão). Inclui:

- **14 vídeos** (audiovisuais 2015): Almanaque, Arca de Noé, Bandalhismo, Bebadosamba, Cavaquinho, Clara Nunes, Clementina, Zeca Pagodinho, Ópera do Malandro, João Nogueira, Tendinha, Terreiro Sala e Salão, Traço de União.
- **Obras físicas**: Arca de Noé 2, Brasil História, Calunga, Dom Paulo (Opinião), Encarte disco Paulinho da Viola, Fátima Guedes (Caderno), Fátima Guedes (Lápis de Cor), Gabriela, Legião Estrangeira, Mão (Movimento), Movimento, Muro de Arrimo, Nervos de Aço, O Processo, Papai Noel, Pixinguinha, Samba de Dandara, Shapes 5 unidades.

Total final: **116 obras**.

### 2. Nova parede para as obras sem parede
Todas as 31 novas entradas recebem o mesmo valor de `parede`, ex.: **"Obras adicionais"** (uma seção própria no acervo). Como `obrasPorParede()` agrupa por esse campo, elas aparecem juntas no fim da página `/obras`.

- Os vídeos não têm campo distinto na planilha; serão catalogados como obras normais nesta parede. Sem player de vídeo dedicado nesta etapa (apenas ficha de catálogo), já que não há arquivos de vídeo no projeto.

### 3. Gravar a entrada 112 sobre a 68 (Aqualouco)
Atualizar os campos `ano`/`tecnica` (e demais divergentes) da **obra 68** com os valores da entrada **112** da planilha (1987; "Caneta, nanquim e colagens"), substituindo os dados antigos (1981; "Acrílica e lápis").

### 4. Ajustes de contagem
Atualizar os textos que citam "85 obras":
- `src/routes/obras.index.tsx` (head/description e `obras.length` já é dinâmico, mas o texto fixo da meta-descrição menciona 85).
- Quaisquer outras referências fixas a "85" (ex.: `src/routes/index.tsx`).

## Campos sem dados
As novas obras entram com `imagem: imagemDaObra(num)` e `audio: audioDaObra(num)` (retornam `null` enquanto não houver arquivos correspondentes) e `descricao` gerada no padrão de ficha (igual às obras sem descrição longa, ex.: "Obra número N: Título. Elifas Andreato, ano. Técnica: …").

```text
Planilha (116) ─┬─ 85 já no site → mantidas (68 recebe dados da 112)
                └─ 31 faltantes → nova parede "Obras adicionais"
                                   (14 vídeos + 17 obras físicas)
```

## Observações
- Mudança apenas em dados/conteúdo frontend (`src/data/obras.ts`) e textos de meta; sem backend, banco ou storage.
- Imagens/áudios das novas obras podem ser anexados depois — basta adicionar `obra-N.jpg`/`obra-N.mp3` com a numeração nova.
