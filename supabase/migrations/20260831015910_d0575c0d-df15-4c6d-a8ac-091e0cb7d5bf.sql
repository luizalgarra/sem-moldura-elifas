create table if not exists rede.rate_limit (
  ip text not null,
  janela timestamptz not null,
  contagem integer not null default 0,
  primary key (ip, janela)
);

alter table rede.rate_limit enable row level security;

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
grant execute on function rede.checar_rate_limit(text, integer) to service_role;

notify pgrst, 'reload schema';