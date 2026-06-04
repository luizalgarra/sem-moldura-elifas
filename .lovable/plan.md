## Objetivo

Adicionar 5 novas obras ao final do acervo, reutilizando os dados da obra "Shapes 5 unidades" (#117) e usando o nome de cada arquivo como título.

## As 5 obras

Títulos (nome do arquivo, sem extensão):

1. Shape 1 Batuqueiro
2. Shape 2 Cantora
3. Shape 3 Guitarrista
4. Shape 4 Conjunto
5. Shape 5 Listas

## Dados aplicados a todas (copiados de "Shapes 5 unidades")

- **Ano:** 2024
- **Autor:** Elifas Andreato
- **Técnica:** Pintura sob madeira
- **Dimensão:** 80cm x 40cm
- **Parede:** Obras adicionais
- **Descrição:** gerada no mesmo padrão, por exemplo: "Obra: Shape 1 Batuqueiro. Elifas Andreato, 2024. Técnica: Pintura sob madeira. Dimensão do original: 80cm x 40cm."

Cada obra recebe a imagem correspondente enviada.

## Como será feito

As 5 obras entram como "obras extras" (mesmo mecanismo do botão "Incluir nova obra" da página /editar), posicionadas em sequência ao final do acervo atual. Numeração das demais obras não muda.

### Passos técnicos

1. Reunir as 5 imagens enviadas (`Shape 1 Batuqueiro.png` … `Shape 5 Listas.png`).
2. Para cada obra, atribuir uma identidade interna livre (chave ≥ 1000) e:
   - Enviar a imagem ao armazenamento (bucket `imagens-obras`).
   - Inserir o registro em `obras_extras` com os dados acima e o caminho da imagem.
   - Acrescentar a chave ao final de `acervo_ordem` (posição = total atual + 1, em sequência).
3. Executar tudo via um script único usando o cliente administrativo (service role), garantindo que a ordem fique contígua.

### Observações

- As novas obras começam sem áudio; a narração pode ser gerada depois pelo botão "Regenerar áudio" em /editar.
- A imagem fica registrada como `.png` e é servida pela rota `/api/public/obra-imagem/{chave}` já existente.
- Nada nas 117 obras anteriores é alterado; os 5 shapes apenas aparecem no fim da sequência (posições 118 a 122).
