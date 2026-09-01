# Painel de chaves e consumo de IA em /modelos

Duas seções novas na página de administração `/modelos`: uma para conferir e trocar a chave da NVIDIA (e das demais), outra para acompanhar o consumo de tokens e o custo estimado por modelo.

## 1. Chaves

- Cartão "Chaves" listando os quatro provedores (Anthropic, OpenAI, Google, NVIDIA) com:
  - status da chave: presente ou ausente (já existe esse dado hoje);
  - botão "Verificar chave" que faz uma chamada mínima ao provedor e mostra "válida" ou o erro devolvido (ex.: 401 = chave expirada);
  - botão "Trocar chave" com instrução clara: a troca é feita pelo formulário seguro da Lovable, pois o valor nunca passa pelo site. O botão abre a caixa de aviso com o nome exato do segredo (`NVIDIA_API_KEY`) e o passo a passo.
- Nenhum valor de chave é exibido, salvo ou transmitido para o navegador.

## 2. Consumo por modelo

Hoje nenhuma chamada de IA é registrada, então o registro é criado agora.

- Toda chamada ao Anfitrião e todo teste feito em `/modelos` passam a gravar: provedor, modelo, tokens de entrada, tokens de saída, duração, origem (conversa ou teste) e sucesso/erro.
- Painel com:
  - filtro de período: hoje, 7 dias, 30 dias, tudo;
  - tabela por modelo: chamadas, erros, tokens de entrada, tokens de saída, custo estimado em US$;
  - total geral do período;
  - gráfico simples de consumo por dia.
- O custo é uma **estimativa**, calculada por uma tabela de preços por modelo mantida no código (US$ por milhão de tokens de entrada/saída), com aviso na tela de que o valor oficial é o do painel de cada provedor. Modelos sem preço cadastrado aparecem com "—".

## Detalhes técnicos

- **Banco**: nova tabela `public.ia_uso` (`id`, `provedor`, `modelo`, `tokens_entrada`, `tokens_saida`, `ms`, `origem`, `ok`, `erro`, `created_at`), com `GRANT` para `service_role`, `GRANT SELECT` para `authenticated`, RLS ligada e política de leitura `is_admin()`. Escrita só pelo servidor (service role). Índice em `created_at` e `modelo`.
- **Registro**: `src/lib/ia-provedores.server.ts` passa a devolver o `usage` normalizado de cada provedor (Anthropic `usage.input_tokens/output_tokens`, OpenAI `usage.prompt_tokens/completion_tokens`, Google `usageMetadata`, NVIDIA formato OpenAI) e grava a linha em `ia_uso` via `supabaseAdmin`, sem quebrar a conversa se a gravação falhar.
- **Preços**: novo `src/lib/ia-precos.ts` com o mapa `modelo -> { entrada, saida }` em US$/milhão de tokens.
- **Server functions** em `src/lib/ia-config.functions.ts` (todas com `requireSupabaseAuth` + checagem `is_admin`):
  - `verificarChave({ provedor })` — ping barato ao provedor, devolve ok/erro sem expor a chave;
  - `resumoUsoIA({ periodo })` — agregação por modelo e por dia.
- **Tela**: `src/routes/modelos.tsx` ganha as duas seções, usando o mesmo padrão de `useServerFn` + `useQuery` com `enabled` após a sessão de admin carregar.
- A troca efetiva do segredo continua sendo feita pelo formulário seguro da Lovable (`update_secret`), acionado a pedido no chat — a tela apenas orienta e mostra o status.
