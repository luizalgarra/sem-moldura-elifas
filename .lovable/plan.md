## Causa raiz

A IA não consegue analisar a imagem porque a função que baixa o asset estático falha em silêncio. O log do servidor confirma:

```text
baixarImagemEstatica erro: https://localhost:8080/__l5e/assets-v1/.../obra-115.jpg
TypeError: fetch failed
```

A função `baixarImagemEstatica` (em `src/lib/admin-obras.functions.ts`) resolve a URL relativa do asset (`/__l5e/...`) contra a **origem do request**, que em execução é `localhost:8080`. Esse host não serve os assets da plataforma, então o `fetch` falha. Existe um fallback para `process.env.SITE_URL`, mas essa variável de ambiente **não existe** — o domínio público do site está apenas na constante `SITE_URL` de `src/lib/site.ts`. Sem nenhuma origem válida, o download falha e tanto o "Cadastrar imagens das obras (IA)" quanto o "Gerar audiodescrição (IA)" por obra exibem o aviso.

Os assets `/__l5e/...` são imutáveis e ficam disponíveis em qualquer origem onde o site está publicado (ex.: o domínio público `institutoelifasandreato.org.br`).

## O que será feito

1. **Usar o domínio público como origem confiável** (`src/lib/admin-obras.functions.ts`, função `baixarImagemEstatica`)
   - Importar a constante `SITE_URL` de `@/lib/site` (código server-only, import seguro).
   - Acrescentar a origem dessa constante à lista de `candidatas`, além da origem do request e de `process.env.SITE_URL`/`VITE_SITE_URL` (que continuam como tentativas extras).
   - Ordenar para que origens públicas conhecidas (que realmente servem `/__l5e/...`) sejam tentadas antes de `localhost`.

2. **Manter os logs de diagnóstico** já existentes, para que qualquer falha futura (status != 200, host inválido) continue registrada com a URL tentada.

## Resultado esperado

- Com o domínio público nas origens candidatas, o asset `/__l5e/...` é baixado com sucesso a partir de `https://institutoelifasandreato.org.br/__l5e/...`.
- "Cadastrar imagens das obras (IA)" passa a gravar `imagem_path` para as obras com imagem estática.
- "Gerar audiodescrição (IA)" por obra deixa de mostrar "Esta obra não tem imagem cadastrada para a IA analisar" (caminho rápido via storage, e o fallback estático passa a funcionar).

## Detalhes técnicos

- Nenhuma mudança de schema, RLS, migração ou novo segredo.
- A constante `SITE_URL` já existe e aponta para o domínio público; reutilizá-la evita depender de variável de ambiente inexistente.
- Sem alterações no site público nem no fluxo de UI; apenas a resolução de origem do download é corrigida.
