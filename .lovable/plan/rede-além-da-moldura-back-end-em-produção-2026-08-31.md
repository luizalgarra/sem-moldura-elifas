# Rede Além da Moldura — back-end em produção

## Respostas às suas duas confirmações

1. **`SUPABASE_SERVICE_ROLE_KEY`**: presente no ambiente do servidor (preview e publicado). Ela só é lida dentro do handler, nunca chega ao navegador.
2. **Tempo máximo de requisição**: o servidor deste site roda em Cloudflare Workers. Não há corte por tempo de espera de chamadas externas — o limite é de CPU própria (~30s), e esperar a Anthropic responder não consome CPU. Uma volta de 5–15s com até quatro chamadas encadeadas ao modelo cabe sem problema. O cuidado real é o tempo de espera do navegador; vou manter cada volta em uma única requisição e mostrar o "digitando".

## O que falta para começar (bloqueios reais)

Conferi o banco de produção: **o schema `rede` não existe** e não há nenhuma tabela `rede_*`. Também não existe código das funções neste projeto. Então não há o que "implantar" — é um porte. Preciso de você:

- O **SQL do schema** `rede` da réplica (tabelas `membros`, `lista_espera`/`rede_lista_espera`, conversas/mensagens, tokens de retomada, fichas — com índices, inclusive o único por `lower(email)`, e as políticas de acesso).
- O conteúdo de **`rede-inscrever/index.ts`**, **`rede-conversa/index.ts`** e **`rede-saude/index.ts`**, mais o **LEIA-ME** com os quatro defeitos corrigidos.
- O segredo **`ANTHROPIC_API_KEY`** — não está no projeto hoje; vou pedir por um campo seguro.

## O que farei quando isso chegar

### 1. Banco
Uma migração que recria o schema `rede` em produção, idêntico ao da réplica (tabelas, índices, RLS). Nada de "melhorias" de modelagem.

### 2. Endpoints
Três rotas de servidor, mantendo o contrato palavra por palavra:

```text
POST /api/rede/inscrever   -> { lista_espera_id, email, ja_inscrito }
POST /api/rede/conversa    -> ações: abrir | falar | retomar | aprovar_ficha
GET  /api/rede/saude       -> diagnóstico (nunca devolve o valor da chave)
```

Porte mecânico: `Deno.serve` vira handler da rota; `Deno.env.get(...)` vira `process.env[...]` lido dentro do handler. Prompt do Anfitrião, mapa de pendências, esquemas das ferramentas e regras de segurança copiados literalmente — sem reescrever lógica nem texto.

### 3. Modelo
Chamada direta a `https://api.anthropic.com/v1/messages` com `x-api-key` (segredo `ANTHROPIC_API_KEY`), `anthropic-version: 2023-06-01`, modelo `claude-sonnet-5` sobrescrevível pela variável `MODELO`, `max_tokens: 1024`. Laço de `tool_use` / `tool_result` preservado. Retry: até três tentativas com espera crescente em 5xx e 429; desiste em 4xx que não seja 429. Sem gateway de IA da plataforma.

### 4. Telas
Só troco o encanamento em `src/lib/rede-backend.ts`: as chamadas passam a apontar para `/api/rede/...` em vez de `functions/v1/...`. `rede-alem-da-moldura`, `continuar` e `guardiao` ficam como estão. Vocabulário: **estrela**, nunca "girassol"; nenhum número sobre dinheiro inventado na interface.

### 5. Conferência antes de eu dizer que terminou
- Enviar o formulário abre a conversa na mesma página, sem recarregar
- Segundo envio com o mesmo e-mail abre a conversa, sem erro na tela
- Uma conversa real até o fim: emissão do link de retomada e proposta de ficha
- `/continuar?t=<token>` real retoma; token inválido mostra o recado
- `/guardiao` lista o membro e aprova a ficha, alterando só `status`, `estagio_escada`, `revisado_por`, `revisado_em`, `observacao_guardiao`
- `/api/rede/saude` responde verde
- Nenhuma referência a `ghtqfxjpgnjbdfjxfjhq` no código

Nada será publicado — o publish continua manual.

## Detalhes técnicos

- Rotas em `src/routes/api/rede/*.ts` (`createFileRoute` com bloco `server`). Ficam fora de `/api/public/` porque só o próprio site as chama; a validação de entrada e o limite por IP vêm do código portado.
- Escrita no banco pelo cliente de serviço carregado dentro do handler (`await import('@/integrations/supabase/client.server')`), com `db: { schema: 'rede' }`.
- `/guardiao` continua lendo o schema `rede` pelo cliente publicável com sessão do magic link e RLS.
