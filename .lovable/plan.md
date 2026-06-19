# Corrigir o botão "Baixar áudio"

## Problema
No editor de obras (`src/routes/admin.tsx`), o botão **Baixar áudio** é um link `<a href={downloadSrc} download>`. Quando `downloadSrc` aponta para uma URL de outra origem (o áudio estático vem da CDN de assets), o navegador ignora o atributo `download` e **navega** o navegador até o arquivo. Isso descarta a página `/admin` e todo o estado em memória do componente (texto da audiodescrição gerado, locução recém-criada, mensagens). Ao voltar, a query recarrega do banco e parece que "sumiu tudo e voltou ao que estava".

## Solução
Trocar o link de download por um download programático via `fetch` + Blob, que nunca navega nem recarrega a página.

### Mudanças em `src/routes/admin.tsx` (componente `ObraEditor`)
- Adicionar um handler `handleBaixar` que:
  - Faz `fetch(downloadSrc)` e obtém o `blob()`.
  - Cria uma URL temporária com `URL.createObjectURL(blob)`.
  - Cria um elemento `<a>` em memória com `download="obra-${num}.mp3"`, dispara o clique e revoga a URL com `URL.revokeObjectURL`.
  - Em caso de erro, mostra mensagem em `msg` (ex.: "Não foi possível baixar o áudio.").
  - Usa um estado `baixando` para desabilitar o botão e mostrar o spinner durante o download.
- Substituir o `<Button asChild><a href=... download></a></Button>` por um `<Button onClick={handleBaixar} disabled={baixando}>` comum, mantendo o ícone `Download` e o texto "Baixar áudio".

Nenhuma outra lógica (geração de texto, locução, histórico, banco) é alterada — apenas o mecanismo de download deixa de recarregar a página.

## Resultado
Clicar em **Baixar áudio** baixa o arquivo sem navegar, preservando o texto gerado, a locução e o estado da tela.
