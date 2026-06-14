## Objetivo

Reestruturar a navegação principal do site para 5 itens de primeiro nível, cada um com menu suspenso (dropdown no desktop, colapsável no mobile), mantendo o estilo visual, tipografia e componentes atuais do header. Criar como páginas-stub (apenas título) todas as rotas que ainda não existem, sem alterar o restante do site.

## Nova estrutura de navegação

```
1. O Instituto            /instituto
   - Missão e Legado      /instituto/missao-e-legado
   - Pilares              /instituto/pilares
   - Governança           /instituto/governanca
   - Rede de Parceiros    /instituto/rede-de-parceiros
   - Transparência        /instituto/transparencia

2. Elifas Andreato        /elifas-andreato
   - Biografia            /elifas-andreato/biografia
   - Carreira Editorial   /elifas-andreato/carreira-editorial
   - Música Popular Brasileira  /elifas-andreato/musica-popular-brasileira
   - Arte e Resistência   /elifas-andreato/arte-e-resistencia
   - Reconhecimentos      /elifas-andreato/reconhecimentos

3. Acervo                 /acervo
   - Busca                /acervo/busca
   - Capas de Discos e Revistas  /acervo/capas-de-discos-e-revistas
   - Fotografias e Cromos /acervo/fotografias-e-cromos
   - Quadros e Ilustrações /acervo/quadros-e-ilustracoes
   - Cadernos e Manuscritos /acervo/cadernos-e-manuscritos
   - Exposições Virtuais  /acervo/exposicoes-virtuais
   - Conservação e Restauro /acervo/conservacao-e-restauro
   - Como Citar           /acervo/como-citar
   - Datasets e Downloads /acervo/datasets-e-downloads

4. Espaços de Memória     /espacos-de-memoria
   - Praça Memorial Vladimir Herzog  /espacos-de-memoria/praca-memorial-vladimir-herzog
     (âncoras na página: Vlado Vitorioso, Mosaico 25 de Outubro,
      Calçadão do Reconhecimento, Espaço Cultural a Céu Aberto)

5. Participe              /participe
   - Agenda               /participe/agenda
   - Oficinas             /participe/oficinas
   - Patrocine            /participe/patrocine
   - Boletim              /participe/boletim
   - Contato              /participe/contato
```

## O que será feito

### 1. Header com menus suspensos (`src/components/SiteHeader.tsx`)
- Substituir a `<nav>` atual (Acervo / Linhas da Vida / Sobre / Como usar) pelos 5 itens de primeiro nível.
- Desktop: usar o componente já existente `src/components/ui/navigation-menu.tsx` (Radix) para os dropdowns — mantém cores, tipografia e o look-and-feel do header. Cada item de topo abre um painel com seus subitens (`<Link>` do TanStack Router com `activeProps`).
- Mobile: menu colapsável (botão "hambúrguer") usando o `Sheet` já disponível em `src/components/ui/sheet.tsx`, listando os grupos e subitens em acordeão/coluna. Mantém o botão "Sair" e os controles de acessibilidade já presentes.
- Sem mudanças de cor, layout do header ou design — apenas conteúdo/estrutura do menu e o comportamento responsivo.

### 2. Criação das páginas-stub (`src/routes/`)
Para cada rota acima que ainda não existe, criar um arquivo de rota seguindo o padrão atual do projeto (`createFileRoute` + `head()` com title/description + componente simples com apenas um `<h1>` e um parágrafo curto de placeholder). Nomenclatura por pontos:
- `instituto.tsx`, `instituto.missao-e-legado.tsx`, `instituto.pilares.tsx`, `instituto.governanca.tsx`, `instituto.rede-de-parceiros.tsx`, `instituto.transparencia.tsx`
- `elifas-andreato.tsx` e os 5 filhos correspondentes
- `acervo.tsx` e os 9 filhos correspondentes
- `espacos-de-memoria.tsx` e `espacos-de-memoria.praca-memorial-vladimir-herzog.tsx` (com seções `id` para as 4 âncoras)
- `participe.tsx` e os 5 filhos correspondentes

Cada rota "pai" (`instituto.tsx`, `acervo.tsx`, etc.) renderiza `<Outlet />` para os filhos e, quando acessada diretamente, mostra um índice com links para os subitens.

O `src/routeTree.gen.ts` é gerado automaticamente — não será editado manualmente.

### 3. Preservação do existente
- Rotas atuais (`/obras`, `/sobre`, `/como-usar`, `/linhas-da-vida`, `/qrcodes`, `/editar`, `/admin`, `/auth`) permanecem intactas.
- O rodapé e a home não mudam.
- O controle de acesso por admin do `__root.tsx` continua valendo automaticamente para as novas páginas internas (sem alterações nesse arquivo).

## Detalhes técnicos
- Todas as novas rotas ficam sob o gate de admin existente (qualquer rota que não seja `/` ou `/auth` exige login de administrador) — comportamento herdado, nenhuma mudança em `__root.tsx`.
- Dropdowns: `NavigationMenu`/`NavigationMenuTrigger`/`NavigationMenuContent` já existem em `ui/`. Mobile: `Sheet` + lista.
- Stubs usam apenas tokens semânticos de design já em uso (`text-foreground`, `text-muted-foreground`, `font-serif`), sem novas cores.

## Observação
A navegação nova aponta para `/acervo`, enquanto o acervo real hoje vive em `/obras`. Nesta entrega, `/acervo` será um stub (índice das subseções) e `/obras` permanece como está. Posso, num passo seguinte, redirecionar/migrar `/obras` para `/acervo` se desejar — diga se quer isso já agora.