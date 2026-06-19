## Diagnóstico

A locução recente foi realmente gerada e gravada: há um arquivo novo no armazenamento (`obra-1-fem-...mp3`) e o banco aponta para ele. O problema mais provável está no fluxo de retorno/atualização da tela: após gerar, o admin chama `refetch()`, mas o componente mantém estados locais (`versaoAudio`, `audiodescricao`) derivados do `override` antigo e não se sincroniza quando os dados novos chegam. Isso faz parecer que “voltou ao estado”, mesmo quando o áudio foi salvo.

Também encontrei um risco real no backend: o áudio é enviado ao armazenamento antes do registro final no banco. Se o registro falhar ou a função for interrompida nesse intervalo, fica um MP3 órfão e a tela volta sem áudio salvo. Já existem arquivos órfãos antigos, sinal de que esse cenário já aconteceu.

## Plano de correção

1. **Sincronizar o estado local do admin com o banco**
   - Em `src/routes/admin.tsx`, atualizar o `ObraEditor` quando `override` mudar após `refetch()`.
   - Manter o texto que o usuário está digitando durante operações, mas após sucesso de geração/salvamento refletir o `audio_fem_path` novo e não cair de volta no estado anterior.

2. **Usar a versão retornada pelo backend imediatamente**
   - `regenerarAudio` já retorna `versao`.
   - No `handleRegenerar`, trocar `setVersaoAudio(Date.now().toString())` por `setVersaoAudio(r.versao)` para a URL do áudio usar exatamente a versão salva no banco.

3. **Preservar o áudio anterior se algo falhar no final**
   - Em `src/lib/admin-obras.functions.ts`, antes de trocar `audio_fem_path`, buscar o áudio atual.
   - Só substituir o áudio atual após upload e update do banco concluírem.
   - Se o update do banco falhar depois do upload, remover o novo arquivo órfão e retornar erro claro.
   - Não limpar nem apagar o áudio anterior enquanto o novo não estiver registrado.

4. **Retornar mais dados no sucesso da geração**
   - Fazer `regenerarAudio` devolver também `audioPath`/estado salvo suficiente para a interface saber que a persistência aconteceu.
   - No admin, exibir mensagem explícita: “Locução gerada e salva.”

5. **Conferência final**
   - Validar no banco que o registro `audio_fem_path` muda após a geração.
   - Validar que a URL `/api/public/obra-audio/<num>?voz=fem&v=<versao>` responde com áudio.
   - Confirmar que o card do admin permanece com o player e botão de download após o `refetch()`.