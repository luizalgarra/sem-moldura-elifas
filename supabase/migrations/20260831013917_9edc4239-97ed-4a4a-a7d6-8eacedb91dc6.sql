-- ============================================================================
-- Rede Além da Moldura — schema completo, estado final
--
-- Consolida oito migrações da réplica em um só arquivo, já no estado final:
-- sem o vaivém de renomear girassol para estrela, e com as correções que os
-- testes ao vivo obrigaram a fazer.
-- ============================================================================

create schema if not exists rede;

-- ---------------------------------------------------------------- tipos
create type rede.status_membro as enum (
  'rascunho',            -- conversa iniciada, nada fechado
  'etapa_a_completa',    -- passou pela porta: contato, vínculo, acervo, consentimento
  'completo',            -- etapa B fechada
  'ficha_aprovada',      -- a pessoa aprovou a própria ficha
  'aprovado',            -- o Guardião admitiu na Rede
  'recusado',
  'arquivado'
);
create type rede.etapa     as enum ('A', 'B');
create type rede.confianca as enum ('alta', 'media', 'revisar');

-- -------------------------------------------------------------- membros
create table rede.membros (
  id uuid primary key default gen_random_uuid(),
  nome text,
  email text,
  telefone text,
  cidade text,
  uf text,
  vinculo text,
  origem text,                        -- qr_exposicao | site | indicacao | roda
  status rede.status_membro not null default 'rascunho',
  estagio_escada smallint not null default 0 check (estagio_escada between 0 and 8),
  expectativa text,                   -- reconhecimento | pertencimento | renda
  aceita_estrela boolean,
  ficha_texto text,
  ficha_aprovada_em timestamptz,
  revisado_por text,
  revisado_em timestamptz,
  observacao_guardiao text,
  formulario jsonb,                   -- respostas cruas de rede_lista_espera
  lista_espera_id uuid references public.rede_lista_espera(id) on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

comment on table  rede.membros is 'Pessoa em processo de entrada. Nasce como rascunho na primeira mensagem — quem abandona no meio continua registrado.';
comment on column rede.membros.estagio_escada is '0 interessado, 1 presente, 2 membro de círculo, 3 respondente, 4 membro pleno, 5 membro-comerciante, 6 anfitrião, 7 guardião, 8 facilitador';
comment on column rede.membros.aceita_estrela is 'Aceita receber em estrela pelo que vende ou presta. Sem comércio interno, o valor sai da rede na primeira volta.';
comment on column rede.membros.formulario is 'Semente da conversa: o agente parte daqui e nunca repergunta o que a pessoa já respondeu.';

-- ------------------------------------------------------------ conversas
create table rede.conversas (
  id uuid primary key default gen_random_uuid(),
  membro_id uuid not null references rede.membros(id) on delete cascade,
  etapa rede.etapa not null,
  estado_atual text not null default 'S0_ACOLHIMENTO',
  canal text not null default 'web',
  sessao_hash text,                   -- SHA-256 do segredo de sessão
  tentativas jsonb not null default '{}'::jsonb,
  foco text,
  iniciada_em timestamptz not null default now(),
  encerrada_em timestamptz
);

comment on column rede.conversas.tentativas is 'Ex: {"acervo": 2}. Ao chegar em 2, o agente para de puxar pelo lado e explica a própria função.';

create table rede.mensagens (
  id uuid primary key default gen_random_uuid(),
  conversa_id uuid not null references rede.conversas(id) on delete cascade,
  papel text not null check (papel in ('agente', 'pessoa', 'sistema')),
  estado text,
  conteudo text not null,
  criado_em timestamptz not null default now()
);

-- ------------------------------------------------------------ respostas
create table rede.respostas (
  id uuid primary key default gen_random_uuid(),
  membro_id uuid not null references rede.membros(id) on delete cascade,
  bloco text not null,                -- oficio | logistica | dispensa
  chave text not null,
  valor text,
  texto_original text,
  confianca rede.confianca not null default 'alta',
  criado_em timestamptz not null default now(),
  unique (membro_id, bloco, chave)
);

comment on table  rede.respostas is 'Em bloco = dispensa, a chave é o nome da pendência que a pessoa recusou depois da escalada.';
comment on column rede.respostas.confianca is 'revisar = genérica ou possivelmente sintética. Marca para leitura humana; nunca rejeita.';

-- ------------------------------------------------------- acervo e oferta
create table rede.acervo_declarado (
  id uuid primary key default gen_random_uuid(),
  membro_id uuid not null references rede.membros(id) on delete cascade,
  tipo text,                          -- capa | cartaz | fasciculo | foto | revista | carta | memoria | objeto
  descricao text not null,
  epoca text,
  possui_original boolean,
  pode_digitalizar boolean,
  direitos_terceiros boolean default false,
  confianca rede.confianca not null default 'alta',
  criado_em timestamptz not null default now()
);

comment on column rede.acervo_declarado.direitos_terceiros is 'Obra com direitos de herdeiros, gravadoras ou editoras. Trava publicação até curadoria.';
comment on column rede.acervo_declarado.confianca is 'Elogio genérico não é acervo: item revisar fica guardado mas não fecha a pendência.';

create table rede.ofertas (
  id uuid primary key default gen_random_uuid(),
  membro_id uuid not null references rede.membros(id) on delete cascade,
  tipo text,
  descricao text not null,
  aceita_estrela boolean not null default false,
  criado_em timestamptz not null default now()
);

-- -------------------------------------------------------- consentimentos
create table rede.consentimentos (
  id uuid primary key default gen_random_uuid(),
  membro_id uuid not null references rede.membros(id) on delete cascade,
  finalidade text not null check (finalidade in (
    'guardar', 'contatar', 'publicar_ficha', 'publicar_acervo', 'imagem_voz'
  )),
  concedido boolean not null,
  versao_termo text not null,
  registrado_em timestamptz not null default now(),
  unique (membro_id, finalidade, versao_termo)
);

comment on table rede.consentimentos is 'Guardar e publicar são atos separados por desenho: muita memória chega com direitos de terceiros.';

-- ------------------------------------------ retomada, convite, sinais
create table rede.tokens_retomada (
  token_hash text primary key,
  membro_id uuid not null references rede.membros(id) on delete cascade,
  etapa rede.etapa not null default 'B',
  expira_em timestamptz not null default (now() + interval '30 days'),
  usado_em timestamptz,
  criado_em timestamptz not null default now()
);

comment on column rede.tokens_retomada.token_hash is 'SHA-256 do token. O token em claro só existe no link entregue à pessoa — um dump do banco não devolve links válidos.';

create table rede.convites (
  id uuid primary key default gen_random_uuid(),
  membro_id uuid not null references rede.membros(id) on delete cascade,
  roda_titulo text,
  roda_em timestamptz,
  local text,
  enviado_em timestamptz,
  confirmado_em timestamptz,
  compareceu boolean,
  criado_em timestamptz not null default now()
);

create table rede.sinais (
  id uuid primary key default gen_random_uuid(),
  membro_id uuid not null references rede.membros(id) on delete cascade,
  tipo text not null,   -- retorno_etapa_b | abandono_bloco | recusa_pendencia | 1a_semente
  detalhe text,
  criado_em timestamptz not null default now()
);

comment on table rede.sinais is 'O que o sistema observa em vez de perguntar. As três portas estreitas da escada.';

create table rede.rate_limit (
  ip text not null,
  janela timestamptz not null,
  contagem integer not null default 1,
  primary key (ip, janela)
);

-- ------------------------------------------------------------- índices
create index on rede.membros (status);
create index on rede.membros (lower(email));
create index on rede.conversas (membro_id);
create index on rede.conversas (sessao_hash);
create index on rede.mensagens (conversa_id, criado_em);
create index on rede.respostas (membro_id);
create index on rede.acervo_declarado (membro_id);
create index on rede.ofertas (membro_id);
create index on rede.consentimentos (membro_id);
create index on rede.tokens_retomada (membro_id);
create index on rede.convites (membro_id);
create index on rede.sinais (membro_id);

-- --------------------------------------------------------- atualizado_em
create or replace function rede.touch_atualizado_em()
returns trigger
language plpgsql
set search_path = pg_catalog, pg_temp
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

create trigger trg_membros_touch
  before update on rede.membros
  for each row execute function rede.touch_atualizado_em();

-- ----------------------------------------------------------- rate limit
create or replace function rede.checar_rate_limit(p_ip text, p_teto integer default 10)
returns boolean
language plpgsql
security definer
set search_path = rede, pg_catalog, pg_temp
as $$
declare
  v_janela timestamptz := date_trunc('hour', now());
  v_contagem integer;
begin
  delete from rede.rate_limit where janela < now() - interval '1 day';

  insert into rede.rate_limit (ip, janela, contagem)
  values (p_ip, v_janela, 1)
  on conflict (ip, janela)
    do update set contagem = rede.rate_limit.contagem + 1
  returning contagem into v_contagem;

  return v_contagem <= p_teto;
end;
$$;

revoke execute on function rede.checar_rate_limit(text, integer) from public, anon, authenticated;
grant  execute on function rede.checar_rate_limit(text, integer) to service_role;

-- ------------------------------------------------------------- Guardião
-- Reaproveita public.admin_emails, que este projeto já usa para o painel do acervo.
create or replace function rede.is_guardiao()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.admin_emails a
    where lower(a.email) = lower(auth.jwt() ->> 'email')
  );
$$;

revoke execute on function rede.is_guardiao() from public, anon;
grant  execute on function rede.is_guardiao() to authenticated;

-- ------------------------------------------------------------------ RLS
-- Negada por padrão. Escrita só pela função de servidor (service_role, que ignora RLS).
alter table rede.membros          enable row level security;
alter table rede.conversas        enable row level security;
alter table rede.mensagens        enable row level security;
alter table rede.respostas        enable row level security;
alter table rede.acervo_declarado enable row level security;
alter table rede.ofertas          enable row level security;
alter table rede.consentimentos   enable row level security;
alter table rede.tokens_retomada  enable row level security;
alter table rede.convites         enable row level security;
alter table rede.sinais           enable row level security;
alter table rede.rate_limit       enable row level security;

create policy guardiao_le on rede.membros          for select to authenticated using (rede.is_guardiao());
create policy guardiao_le on rede.conversas        for select to authenticated using (rede.is_guardiao());
create policy guardiao_le on rede.mensagens        for select to authenticated using (rede.is_guardiao());
create policy guardiao_le on rede.respostas        for select to authenticated using (rede.is_guardiao());
create policy guardiao_le on rede.acervo_declarado for select to authenticated using (rede.is_guardiao());
create policy guardiao_le on rede.ofertas          for select to authenticated using (rede.is_guardiao());
create policy guardiao_le on rede.consentimentos   for select to authenticated using (rede.is_guardiao());
create policy guardiao_le on rede.convites         for select to authenticated using (rede.is_guardiao());
create policy guardiao_le on rede.sinais           for select to authenticated using (rede.is_guardiao());

create policy guardiao_revisa on rede.membros
  for update to authenticated using (rede.is_guardiao()) with check (rede.is_guardiao());

create policy guardiao_convida on rede.convites
  for all to authenticated using (rede.is_guardiao()) with check (rede.is_guardiao());

-- tokens_retomada e rate_limit ficam sem policy nenhuma: só service_role enxerga.

-- --------------------------------------------------------------- grants
-- Um schema novo não herda os grants do public.
grant usage on schema rede to service_role;
grant all privileges on all tables    in schema rede to service_role;
grant all privileges on all sequences in schema rede to service_role;
alter default privileges in schema rede grant all on tables    to service_role;
alter default privileges in schema rede grant all on sequences to service_role;

grant usage on schema rede to authenticated;
grant select on
  rede.membros, rede.conversas, rede.mensagens, rede.respostas,
  rede.acervo_declarado, rede.ofertas, rede.consentimentos,
  rede.convites, rede.sinais
to authenticated;

-- O Guardião julga, não reescreve o que a pessoa disse.
-- Só estas cinco colunas. Alterar ficha_texto é recusado pelo banco.
grant update (status, estagio_escada, revisado_por, revisado_em, observacao_guardiao)
  on rede.membros to authenticated;
grant all on rede.convites to authenticated;

-- anon nunca toca o schema, nem por engano de policy.
revoke all on schema rede from anon;
revoke all on all tables in schema rede from anon;

-- ------------------------------------------------------- fila do Guardião
create view rede.fila_guardiao
with (security_invoker = true) as
select
  m.id, m.nome, m.email, m.telefone, m.cidade, m.uf,
  m.vinculo, m.origem, m.status, m.expectativa, m.aceita_estrela,
  m.ficha_texto, m.ficha_aprovada_em, m.observacao_guardiao,
  (select count(*) from rede.acervo_declarado a
     where a.membro_id = m.id and a.confianca <> 'revisar')      as itens_acervo,
  (select count(*) from rede.ofertas o where o.membro_id = m.id) as ofertas,
  (select count(*) from rede.respostas r
     where r.membro_id = m.id and r.confianca = 'revisar')       as a_revisar,
  (select count(*) from rede.respostas r
     where r.membro_id = m.id and r.bloco = 'dispensa')          as recusas,
  m.criado_em, m.atualizado_em
from rede.membros m
where m.status in ('etapa_a_completa', 'completo', 'ficha_aprovada', 'aprovado', 'recusado')
order by m.ficha_aprovada_em nulls last, m.criado_em;

comment on view rede.fila_guardiao is 'O Guardião lê a ficha, não a transcrição.';

grant select on rede.fila_guardiao to authenticated;