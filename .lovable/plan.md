## Problema

Ao clicar em "Gerar PDF para impressão →", a URL muda para `/qrcodes/imprimir`, mas a página continua mostrando a listagem de QR Codes (conteúdo de `/qrcodes`) — a tela de seleção e o botão "Gerar PDF" nunca aparecem.

## Causa

No roteamento por arquivos do TanStack Router, a existência de `src/routes/qrcodes.imprimir.tsx` transforma `src/routes/qrcodes.tsx` em **rota de layout pai** de `/qrcodes/imprimir`. Como `qrcodes.tsx` não renderiza `<Outlet />`, a rota filha casa mas não tem onde ser exibida — então o usuário vê sempre o conteúdo do pai (a listagem).

## Solução

Reorganizar para o padrão correto de layout + index do TanStack:

1. **Criar `src/routes/qrcodes.index.tsx`** — mover para cá todo o conteúdo atual de `qrcodes.tsx` (a página de listagem "QR Codes das obras", com os QR Codes institucionais e das obras). A rota passa a ser `/qrcodes/` (index).

2. **Transformar `src/routes/qrcodes.tsx`** em uma rota de layout simples, que apenas renderiza `<Outlet />`:

```tsx
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/qrcodes")({
  component: () => <Outlet />,
});
```

Resultado:
- `/qrcodes` → renderiza `qrcodes.index.tsx` (listagem, igual a hoje)
- `/qrcodes/imprimir` → renderiza `qrcodes.imprimir.tsx` (seleção + botão "Gerar PDF" funcionando)

## Observações

- Nenhuma alteração na lógica de geração do PDF (`jsPDF` + `qrcode`) — ela já está correta, só não estava sendo exibida.
- O `routeTree.gen.ts` é regenerado automaticamente; não será editado à mão.
- Após a correção, validar na pré-visualização que `/qrcodes/imprimir` mostra a tela de seleção e o download do PDF é disparado.