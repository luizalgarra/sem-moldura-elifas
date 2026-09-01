# Seletor de modelos do Anfitrião

Uma página só para administradores onde você escolhe qual modelo de IA responde nas conversas da Rede Além da Moldura. A escolha é salva no banco e passa a valer para todas as conversas, na hora.

## Como vai funcionar

Nova página `/modelos` (visível apenas para admin, como `/admin` e `/editar`), com:

- Lista de provedores e modelos: **Anthropic**, **OpenAI**, **Google** e **NVIDIA**.
- Marcação de qual está ativo hoje e um botão "Usar este modelo".
- Um selo por provedor indicando se a chave está configurada ("chave presente" / "falta a chave").
- Botão "Testar" por modelo: manda um "oi" e mostra se respondeu, o tempo e o erro, se houver — sem nunca mostrar valores de chave.
- Um campo livre para digitar o nome exato de um modelo do provedor escolhido, caso queira um que não esteja na lista.

Se a chave do provedor escolhido faltar ou falhar, o Anfitrião continua respondendo com o modelo anterior e a falha aparece na página — a conversa de ninguém quebra por causa de uma troca.

## Chaves necessárias

Hoje o projeto só tem `ANTHROPIC_API_KEY`. Para os outros três vou pedir por campo seguro, no momento da execução:

- `OPENAI_API_KEY`
- `GOOGLE_AI_API_KEY` (Gemini direto, não pelo gateway)
- `NVIDIA_API_KEY` (NVIDIA NIM)

Provedor sem chave aparece na lista, mas com o botão desabilitado e o aviso de chave ausente.

## Detalhes técnicos

**Banco** — migração criando `public.ia_config` (linha única: `provedor`, `modelo`, `atualizado_em`, `atualizado_por`), com `GRANT`, RLS ativa, `SELECT`/`UPDATE`/`INSERT` só via `is_admin()`; leitura do servidor pelo service role.

**Servidor** — `src/lib/rede-anfitriao.server.ts` deixa de ler `process.env["MODELO"]` fixo e passa a consultar `ia_config` no início da volta, com fallback para Anthropic/`claude-sonnet-5`. A chamada ao modelo vira um adaptador com quatro implementações, todas mantendo o mesmo laço de ferramentas (`tool_use`/`tool_result`) e a mesma política de retry (3 tentativas, backoff em 5xx e 429):

- Anthropic: `https://api.anthropic.com/v1/messages` (formato atual, sem mudança).
- OpenAI: `https://api.openai.com/v1/chat/completions`, com `tools`/`tool_calls` traduzidos de e para o formato interno.
- Google: `https://generativelanguage.googleapis.com/v1beta/models/{modelo}:generateContent`, com `functionDeclarations`/`functionCall`.
- NVIDIA: `https://integrate.api.nvidia.com/v1/chat/completions` (compatível com OpenAI).

O formato interno das mensagens e das ferramentas continua o da Anthropic; a tradução acontece só na borda de cada provedor, para não reescrever o prompt do Anfitrião nem a lógica das fichas.

**Server functions** — em `src/lib/ia-config.functions.ts`: `lerConfigIA`, `salvarConfigIA` e `testarModelo`, todas com `requireSupabaseAuth` + `garantirAdmin`, no padrão já usado em `admin-obras.functions.ts`. As chaves são lidas apenas dentro dos handlers.

**Rotas** — `src/routes/modelos.tsx` (nova) e o prefixo `/modelos` acrescentado à lista `protegida` em `src/routes/__root.tsx`. `/api/public/rede/saude` passa a informar o provedor e o modelo ativos, ainda sem expor segredos.

## Conferência antes de eu dizer que terminou

- `/modelos` só abre para admin; visitante não vê nada
- Trocar para cada provedor com chave e receber resposta no botão "Testar"
- Uma conversa real do Anfitrião até a proposta de ficha com o modelo trocado, garantindo que as ferramentas ainda funcionam
- Provedor sem chave: aviso claro e Anfitrião seguindo no modelo anterior
- `/api/public/rede/saude` mostrando o provedor e modelo corretos
