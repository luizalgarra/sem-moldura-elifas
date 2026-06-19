## Contexto

As imagens das obras já aparecem no site porque vêm dos **assets estáticos** do projeto (`src/assets/obras/obra-{num}.jpg.asset.json`), mapeados por número em `src/data/obras.ts`. A IA de audiodescrição, porém, prioriza a imagem em `imagem_path` (storage) e só cai num *fallback* que baixa o asset estático. Quando esse fallback falha, surge "Esta obra não tem imagem cadastrada para a IA analisar".

Subir imagem por obra na tela de admin é inviável (são muitas). A solução é popular `imagem_path` de todas as obras de uma vez, reaproveitando os assets estáticos que já existem.

## Objetivo

Permitir que a IA gere audiodescrição de qualquer obra que já tenha imagem estática, sem upload manual.

## O que será feito

1. **Tornar o fallback da IA mais robusto** (`src/lib/admin-obras.functions.ts`, `imagemDataUrl`)
   - Garantir que a busca da imagem estática funcione mesmo quando a origem do request não resolve o caminho `/__l5e/...` (tentar a URL absoluta do asset e logar o motivo da falha em caso de erro), para o fallback deixar de falhar silenciosamente.

2. **Nova server function de backfill em lote** (`admin-obras.functions.ts`)
   - Protegida por `requireSupabaseAuth` + verificação de admin (`ehAdmin`), seguindo o padrão das demais funções.
   - Para cada obra fixa com imagem estática e **sem** `imagem_path`: baixar os bytes do asset estático e enviar ao bucket `imagens-obras`, gravando o `imagem_path` em `obra_overrides` (upsert por `num`).
   - Retornar contagem de sucessos/falhas (`{ ok, total, gravadas, falhas }`).

3. **Botão na área de admin** (`src/routes/admin.tsx`)
   - Adicionar, ao lado de "Gerar locução de todas as obras", um botão **"Cadastrar imagens das obras (IA)"** que chama a função de backfill e mostra progresso/resultado, com `refetch()` ao final.

## Resultado esperado

- Um clique cadastra `imagem_path` para todas as obras que já têm imagem estática.
- A partir daí, "Gerar audiodescrição (IA)" funciona para essas obras (caminho rápido via storage), e o fallback estático cobre eventuais lacunas.

## Detalhes técnicos

- O backfill não altera o site público (apenas grava `imagem_path`; o front continua exibindo o asset estático).
- Reutiliza o bucket privado existente `imagens-obras` e a tabela `obra_overrides`.
- A leitura dos bytes do asset usa `fetch` da URL do asset (`obra.imagem`) dentro do handler server-only; nenhuma credencial nova é necessária.
- Sem mudanças de schema, RLS ou migrações.
