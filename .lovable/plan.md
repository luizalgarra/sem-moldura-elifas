## Problema

No painel `/admin`, o selo de status (ex.: "Texto gerado") é sempre recalculado a partir dos dados do banco (`override`) a cada render, mas os campos de texto (`Descrição` e `Texto da audiodescrição`) usam estado local inicializado **apenas uma vez** na montagem do componente (`useState`).

Quando os dados chegam/recarregam depois da montagem (carregamento assíncrono ou refetch após "Salvar"/"Gerar"), há um único `useEffect` que sincroniza somente a versão do áudio — nada sincroniza os textos. Resultado: o selo mostra "Texto gerado" (porque o banco tem `audiodescricao`), enquanto a caixa "Texto da audiodescrição (locução)" continua exibindo o valor antigo/vazio do estado local.

## Correção

Em `src/routes/admin.tsx`, dentro de `ObraEditor`, adicionar sincronização do estado local dos textos com o `override` quando os dados do banco mudarem, sem descartar edições não salvas do usuário.

### Abordagem
- Adicionar um `useEffect` que observa a identidade dos dados do banco (`override?.updatedAt`, além de `override?.audiodescricao` e `override?.descricao`).
- Quando o `override` for atualizado (novo `updatedAt`), reatualizar:
  - `texto` → `override?.descricao ?? textoEstatico`
  - `audiodescricao` → `override?.audiodescricao ?? override?.descricao ?? textoEstatico`
- Guardar a referência do último `updatedAt` aplicado (via `useRef`) para só reescrever os campos quando os dados realmente mudarem (evitando sobrescrever o que o usuário está digitando entre saves).

Isso garante que, sempre que o banco indicar que existe texto gerado, a caixa correspondente passe a exibi-lo, mantendo o selo e o conteúdo coerentes.

## Verificação
- Build limpo.
- Abrir `/admin`, conferir que obras com selo "Texto gerado"/"Locução gerada" mostram o texto correto na caixa de audiodescrição ao carregar e após gerar/salvar.

Apenas `src/routes/admin.tsx` é alterado; nenhuma função de servidor, dado ou rota muda.