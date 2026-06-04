# Página de edição de obras

Criar uma página separada em `/editar` (link aberto, sem login, como a `/admin` atual) que permite editar **todos os dados** de cada obra: título, ano, autor, técnica, dimensão, parede, descrição, **imagem** e **áudio**. As alterações ficam salvas no banco e aparecem para os visitantes nas páginas das obras.

## Situação atual

- Os dados das 116 obras vivem estáticos em `src/data/obras.ts`.
- Já existe a tabela `obra_overrides` que guarda apenas `descricao`, `audio_url` e `voz_id`.
- A `/admin` edita só descrição e regenera áudio. A página pública (`/obras/$num`) já mescla a descrição/áudio editados sobre o estático.
- Hoje vários pontos limitam o número da obra a 1–85; existem obras até 116.

## O que será feito

### 1. Banco de dados
Ampliar a tabela `obra_overrides` para guardar todos os campos editáveis:
- Novas colunas: `titulo`, `ano`, `autor`, `tecnica`, `dimensao`, `parede`, `imagem_path` (todas opcionais — quando vazias, vale o valor estático).
- Criar um bucket de armazenamento para as imagens enviadas das obras.

### 2. Página `/editar` (nova rota)
- Lista todas as 116 obras com busca por número/título (mesmo padrão visual da `/admin`).
- Para cada obra, um formulário com:
  - Campos de texto: título, ano, autor, técnica, dimensão, parede.
  - Área de texto da descrição.
  - Envio de **nova imagem** (com pré-visualização da imagem atual).
  - Áudio: regenerar (como hoje) — a obra 2 continua protegida.
- Botão "Salvar" por obra; indica quando um campo foi editado.
- Marcada como `noindex` (não aparece em buscadores).

### 3. Lógica de servidor
- Nova função para salvar os campos de dados da obra.
- Nova função para receber e guardar a imagem enviada no bucket e registrar o caminho.
- Reaproveitar as funções existentes de salvar texto e regenerar áudio (ampliando o limite de obra de 85 para 116).

### 4. Refletir nas páginas públicas
- No carregamento da página da obra (`/obras/$num`), mesclar os campos editados (título, ano, técnica, dimensão, parede, descrição, imagem, áudio) sobre os dados estáticos.
- Servir a imagem editada por uma rota pública (igual ao áudio), com fallback para a imagem estática.

## Detalhes técnicos

- Migração `obra_overrides`: `ADD COLUMN` para os campos novos; bucket de imagens via storage; manter GRANTs e RLS existentes.
- Funções em `src/lib/admin-obras.functions.ts`: `salvarDados`, `salvarImagem` (upload), e elevar o `max` de validação de `85` para `116` nas funções e na rota `api/public/obra-audio.$num.ts`.
- Nova rota pública `src/routes/api/public/obra-imagem.$num.ts` para servir a imagem do bucket.
- Nova rota `src/routes/editar.tsx` reutilizando `Input`, `Textarea`, `Button`.
- Ajustar o loader de `src/routes/obras.$num.tsx` para aplicar os overrides de todos os campos.

## Observação
A página fica acessível por link sem senha, exatamente como a `/admin` atual. Se mais tarde quiser proteger ambas com login, dá para adicionar autenticação depois.