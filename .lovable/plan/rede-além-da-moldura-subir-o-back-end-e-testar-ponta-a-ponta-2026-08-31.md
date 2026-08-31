# Rede Além da Moldura — subir o back-end e testar ponta a ponta

Li o zip inteiro (LEIA-ME, protocolo, migração e as três funções). O conteúdo vai como está: prompt, mapa de pendências, esquemas das ferramentas, regras de segurança e retry copiados literalmente. Só troco o encanamento.

## O fantasma antigo, achado antes do teste

Você suspeitava certo, mas a causa é outra: **`public.rede_lista_espera` não existe no banco de produção**. As migrações `20260829040000_rede_lista_espera`, `..._corrige_email_admin` e `..._rede_perfil` estão no repositório mas nunca foram aplicadas. Por isso a página responde "Não foi possível registrar agora" — não é a chave de serviço, é a tabela ausente. Sem ela a migração nova também falharia, porque `rede.membros` referencia essa tabela.

## Passos

### 1. Aplicar as três migrações pendentes
Byte por byte como estão no repositório: cria `rede_lista_espera` (com o índice único por `lower(email)`, RLS ligada, acesso só de serviço), corrige o e-mail do administrador em `admin_emails` e renomeia `convidado_por` para `perfil`.

### 2. Aplicar a migração da Rede
`20260830000000_rede_alem_da_moldura.sql` como veio: schema `rede`, tipos, tabelas, triggers, rate limit, RLS negada por padrão, grants por coluna e a view `fila_guardiao`. Confirmei que `public.admin_emails` existe com esse nome — `rede.is_guardiao()` fica apontando para ela, nada de tabela nova.

### 3. Expor o schema `rede` à API
Você não tem painel do Supabase aqui, mas dá para fazer por SQL no mesmo passo: acrescentar `rede` à lista de schemas expostos e recarregar a configuração. Sem isso, tanto o servidor quanto o painel do Guardião batem no erro `PGRST106` que as próprias funções já sabem explicar.

### 4. As três funções viram endpoints do próprio site
Neste projeto o servidor é o do site (Cloudflare), não Edge Functions — e é o padrão do repositório, como você autorizou ajustar. Porte mecânico, um arquivo para cada:

```text
POST /api/rede/inscrever   -> { lista_espera_id, email, ja_inscrito }
POST /api/rede/conversa    -> abrir | falar | retomar | aprovar_ficha
GET  /api/rede/saude       -> { chave_presente, chave_prefixo, modelo, modelo_status }
```

Só muda: `Deno.serve` vira o handler da rota, `Deno.env.get(...)` vira leitura de ambiente dentro do handler, e o import do cliente Supabase passa a ser o do projeto. Nomes das ações, formato das respostas, códigos de erro (403, 404, 409, 410, 429, 503) e as mensagens ficam idênticos — as telas não mudam de contrato. A chamada à Anthropic continua direta (`x-api-key`, `anthropic-version: 2023-06-01`, modelo `claude-sonnet-5` sobrescrevível por `MODELO`, `max_tokens: 1024`), com o laço de `tool_use` e o retry de três tentativas intactos. `ANTHROPIC_API_KEY` já está salva.

### 5. Ligar as telas
`src/lib/rede-backend.ts` passa a chamar `/api/rede/...`. As telas em si já estão prontas do trabalho anterior e ficam como estão: `/rede-alem-da-moldura` com formulário e conversa na mesma página, `/entrar-na-rede` redirecionando, `/continuar?t=…`, `/guardiao`. Confiro na passada: balões, textarea que cresce, Enter envia e Shift+Enter quebra linha, indicador de digitando, barra de progresso fina sem rótulo, links clicáveis no fechamento, os dois botões da ficha e o texto exato do "Pronto.". Nenhuma tela cita valor em dinheiro; a moeda é **estrela**.

### 6. O painel do Guardião
Fica como está, lendo `rede.fila_guardiao` e alterando só `status`, `estagio_escada`, `revisado_por`, `revisado_em`, `observacao_guardiao` — quem barra as outras é o banco. Sem checagem de permissão no front: quem não é Guardião vê zero linhas. Preciso também acrescentar a URL de `/guardiao` às URLs de retorno da autenticação, senão o link mágico não volta.

### 7. Conferência
- `/api/rede/saude` com `chave_presente: true`, prefixo `sk-ant-` e `modelo_status: 200`
- Formulário abre a conversa na mesma página, sem recarregar
- Mesmo e-mail duas vezes: abre a conversa, sem erro
- Conversa real até o fim da etapa A, com o link de retomada emitido
- `/continuar?t=<token real>` retoma; token inválido mostra o recado
- Etapa B até `propor_ficha`, "Está certo assim" grava a aprovação
- `/guardiao` mostra a pessoa na fila e a decisão persiste
- `/entrar-na-rede` redireciona; nenhuma referência a `ghtqfxjpgnjbdfjxfjhq`

Nada será publicado — o publish continua seu.

## Detalhes técnicos

- Rotas em `src/routes/api/rede/{inscrever,conversa,saude}.ts` (`createFileRoute` com bloco `server`), mesma origem do site — sem CORS e sem chave publicável no cabeçalho, o resto do contrato igual.
- Cliente de serviço criado dentro do handler; a chave de serviço nunca chega ao navegador.
- Se algum teste bater em limite de tempo do navegador numa volta longa do modelo, eu ajusto só a espera do lado da tela, sem tocar na lógica.
