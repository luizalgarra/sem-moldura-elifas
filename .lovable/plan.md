## Objetivo

Tornar a home original do catálogo (`Index`) a página principal em `/`, substituindo a tela temporária "Em construção".

## O que será feito

Arquivo: `src/routes/index.tsx`

1. **Trocar o componente da rota**: alterar `component: EmConstrucao` para `component: Index`.
2. **Restaurar o `head()`** com os metadados reais do catálogo (título e descrição da exposição), em vez do título "Em breve". O `__root.tsx` já define os metadados globais/OG; o `head()` da home apenas refina título e descrição:
   - `title`: "Elifas Andreato — Além da Moldura · Catálogo Virtual"
   - `description`: descrição do catálogo com áudio-descrição e QR Code.
3. **Manter `EmConstrucao` no arquivo** (sem removê-la) para poder voltar a usá-la facilmente no futuro, mas deixar de ser a rota ativa.
4. Como `Index` passa a ser usado, remover o comentário `eslint-disable ... no-unused-vars` que marcava `Index` como não utilizado.

## Observações

- A home `Index` já renderiza hero, cartões de áudio-descrição/QR Code e a grade de obras em destaque — nenhuma lógica nova é necessária.
- O `__root.tsx` trata `/` como "Em construção" hoje (sem header/rodapé). Será necessário ajustar essa regra para que a home volte a exibir o cabeçalho e o rodapé do site.

Arquivo: `src/routes/__root.tsx`

5. Em `Conteudo`, remover (ou ajustar) a constante `emConstrucao = pathname === "/"` para que `/` deixe de ser tratada como página sem layout, passando a exibir `SiteHeader` e `SiteFooter` normalmente.

## Resultado

Ao acessar `/`, o visitante verá a home completa do catálogo com cabeçalho, rodapé, hero, destaques e acesso ao acervo.