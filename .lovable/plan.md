## Plano

Corrigir o botão **Baixar áudio** para que o arquivo seja baixado pelo próprio backend da aplicação, sem depender de `fetch` no navegador nem de URL temporária que pode falhar e provocar perda do estado visual.

### 1. Ajustar o endpoint de áudio
No endpoint `/api/public/obra-audio/$num`:
- adicionar suporte a um parâmetro `download=1`;
- quando esse parâmetro existir, retornar o áudio com cabeçalho `Content-Disposition: attachment; filename="obra-N.mp3"`;
- manter o comportamento atual do player de áudio quando `download=1` não existir.

### 2. Ajustar o botão no admin
Em `src/routes/admin.tsx`:
- trocar o download via `fetch(...).blob()` por um clique programático em um link oculto apontando para `/api/public/obra-audio/${num}?voz=fem&download=1&v=...` quando houver áudio gerado;
- para áudio estático antigo, manter fallback seguro abrindo em nova aba se necessário;
- não chamar `onChanged()` nem `refetch()` no download, para não recarregar a lista de obras.

### 3. Proteger o texto recém-gerado contra refetch
Ainda em `src/routes/admin.tsx`:
- impedir que uma atualização da lista sobrescreva o texto em edição enquanto o usuário está com audiodescrição/locução recém-gerada na tela;
- manter o conteúdo local até o usuário salvar, gerar novamente ou restaurar uma versão.

### Resultado esperado
Clicar em **Baixar áudio** deve baixar o arquivo sem recarregar a página, sem limpar o texto gerado e sem voltar ao estado anterior.