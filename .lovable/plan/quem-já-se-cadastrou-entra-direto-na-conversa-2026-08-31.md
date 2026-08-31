# Quem já se cadastrou entra direto na conversa

## Objetivo

Hoje, se a pessoa preenche o formulário uma segunda vez, o sistema cria um novo cadastro e uma nova conversa do zero — o que ela já contou some. Depois desta mudança, o mesmo formulário reconhece o e-mail já cadastrado e reabre a última conversa dela, com todo o histórico, de onde parou.

## Como fica para a pessoa

- O formulário continua igual (nome, e-mail, vínculo).
- Se o e-mail já estiver cadastrado, ela vai direto para a tela limpa da conversa, com as mensagens anteriores na tela e o Anfitrião retomando o fio.
- Se for a primeira vez, nada muda: conversa nova, como hoje.

## Mudanças

### 1. Ação `abrir` passa a reconhecer quem volta (`src/lib/rede-anfitriao.server.ts`)

Ao receber a inscrição:

1. Procura um membro já existente ligado a essa inscrição (mesmo `lista_espera_id`, com conferência do e-mail como hoje).
2. **Não existe** → fluxo atual: cria membro, cria conversa, primeira mensagem do Anfitrião.
3. **Existe** → busca a conversa mais recente ainda não encerrada desse membro:
   - Gera uma nova senha de sessão e grava seu `sessao_hash` na conversa (a sessão antiga deixa de valer — só quem acabou de provar o e-mail entra).
   - Devolve `conversa_id`, `sessao`, `etapa`, o histórico de mensagens, o que ainda falta e as ferramentas disponíveis (mesmo formato da ação `estado`).
   - Sem mensagem nova do modelo: a tela abre exatamente onde parou.
4. Se todas as conversas do membro estiverem encerradas, abre uma conversa nova para o mesmo membro (sem duplicar cadastro), na etapa correspondente, e o Anfitrião cumprimenta citando o que ela já contou.

### 2. Tela do formulário (`src/routes/rede-alem-da-moldura.index.tsx`)

Depois de `abrir`, se a resposta trouxer histórico (`turnos`), guarda esse histórico no estado local em vez de montar um único turno com `mensagem`. Em seguida navega para `/rede-alem-da-moldura/conversa` como já faz.

### 3. Tipos (`src/lib/rede-backend.ts`)

`RespostaConversa` ganha `turnos?` opcional, para o retorno de quem volta.

## Detalhes técnicos

- Nenhuma mudança de banco: usa as tabelas `rede.membros`, `rede.conversas` e `rede.mensagens` existentes; o membro é localizado por `lista_espera_id` (a inscrição já é única por e-mail).
- A verificação continua sendo "o e-mail informado bate com o da inscrição" — mesmo nível de garantia de hoje, sem senha nem login.
- A rotação do `sessao_hash` mantém uma sessão viva por vez e evita que um navegador antigo continue escrevendo na mesma conversa.

## Verificação

Fluxo ponta a ponta no preview: inscrever → conversar algumas mensagens → sair da conversa → preencher o formulário de novo com o mesmo e-mail → a conversa reabre com o histórico e continua normalmente. Registros de teste removidos ao final.
