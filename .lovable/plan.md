## Objetivo
Tornar as páginas de QR Code (`/qrcodes` e `/qrcodes/imprimir`) inacessíveis pela URL, redirecionando qualquer acesso para a página inicial.

## Alteração
- **`src/routes/qrcodes.tsx`** (rota de layout pai de ambas): adicionar um `beforeLoad` que lança um `redirect({ to: "/" })`. Como essa rota é o pai (`Outlet`) de `/qrcodes` e `/qrcodes/imprimir`, o redirecionamento cobre as duas páginas de uma só vez.

```tsx
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/qrcodes")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => <Outlet />,
});
```

## Detalhes técnicos
- Os arquivos `qrcodes.index.tsx` e `qrcodes.imprimir.tsx` serão mantidos como estão; o bloqueio acontece no nível do layout pai, então não é preciso editá-los.
- Não há links para essas páginas na navegação principal (`src/data/navegacao.ts`), apenas links internos entre `/qrcodes` e `/qrcodes/imprimir` — que deixarão de ser acessíveis pelo redirecionamento.
- Caso no futuro queira reativar, basta remover o `beforeLoad`.
