# Proteger páginas internas para administradores

## Objetivo
Manter a home (`/`) pública ("Em construção") e exigir login de **administrador** para acessar qualquer outra página: Acervo, Obra, Linhas da Vida, Sobre, Como usar, QR Codes, Admin e Editar.

Admin autorizado: **luiz.algarra@gmail.com.br** (confirmar grafia do e-mail).

## Como vai funcionar
- Visitante sem login → vê só a home. Ao tentar abrir qualquer outra rota, é levado à tela de login.
- Pessoa logada mas que **não** é o admin → mensagem "Acesso restrito".
- Admin logado → acessa tudo normalmente (topo, rodapé e todas as páginas).

## Etapas

### 1. Backend (banco + autenticação)
- Habilitar login por **e-mail e senha**, com confirmação automática (sem depender de envio de e-mail).
- Criar tabela `admin_emails` (lista de e-mails autorizados) já com o e-mail do Luiz inserido, com as devidas permissões (GRANT) e RLS.
- Criar função segura `is_admin()` que retorna verdadeiro quando o e-mail do usuário logado está em `admin_emails`.

### 2. Tela de login — nova rota pública `/auth`
- Formulário de **entrar** e **criar conta** (e-mail + senha).
- O admin cria a conta uma vez com o e-mail autorizado e já passa a ter acesso.
- Após entrar, redireciona para a página solicitada (ou para o Acervo).

### 3. Proteção das rotas (porteiro de admin)
- No layout raiz (`__root.tsx`), envolver o conteúdo das rotas que **não** são `/` nem `/auth` com uma verificação:
  - Carrega a sessão e consulta `is_admin()`.
  - Sem sessão → envia para `/auth`.
  - Logado sem permissão → tela "Acesso restrito" com opção de sair.
  - Admin → mostra a página normalmente (com topo e rodapé).
- A home continua intacta, pública e em modo "Em construção".

### 4. Ajustes de apoio
- Botão "Sair" no topo quando o admin estiver logado.
- Marcar `/auth` com `noindex`.

## Observações técnicas
- A verificação é no cliente (sessão fica no navegador). Adequado aqui, pois são páginas internas/administrativas, sem necessidade de SEO.
- A função `is_admin()` é `SECURITY DEFINER` e checa o e-mail do `auth.uid()` contra `admin_emails` — controle de acesso fica no servidor, não no código do front.
- Reversão futura (quando o site for ao ar): basta remover o porteiro de admin do `__root.tsx`; o login e a tabela podem permanecer para o Admin/Editar.

## Pendência
Confirmar se o e-mail é `luiz.algarra@gmail.com.br` ou `luiz.algarra@gmail.com`.
