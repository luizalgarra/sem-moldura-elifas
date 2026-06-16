## Objetivo
Ocultar a página "Laura Andreato" do site, removendo-a da navegação para que não apareça mais nos menus.

## Alteração
- **`src/data/navegacao.ts`**: remover o item de menu "Laura Andreato" do grupo "O Instituto" (o bloco com `para: "/instituto/laura-andreato"`).

## Detalhes técnicos
- O arquivo de rota `src/routes/instituto.laura-andreato.tsx` será mantido (não será excluído), de modo que a página continua existindo caso seja acessada por link direto, mas deixa de ser exibida em qualquer menu do site.
- Caso prefira excluir a página por completo (remover também o arquivo de rota e torná-la inacessível pela URL), me avise que ajusto o plano.