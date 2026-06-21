## Objetivo

Resolver a falha "Falha ao gerar áudio (401)" no painel de administração. O 401 é retornado pela própria API da ElevenLabs porque a credencial `ELEVENLABS_API_KEY` em uso está inválida ou expirada. A geração de **texto** (que usa a Lovable AI) continua funcionando — só a **locução por voz** falha.

## Causa

A função `regenerarAudio` chama `https://api.elevenlabs.io/.../text-to-speech` usando o cabeçalho `xi-api-key: ELEVENLABS_API_KEY`. Quando a chave é rejeitada, a ElevenLabs responde `401` e o app exibe a mensagem de erro. Não é um bug de código — é uma credencial inválida.

## Solução

Existe um conector **"Luiz's ElevenLabs"** disponível no workspace, ainda **não vinculado** a este projeto. Vincular o conector sincroniza uma `ELEVENLABS_API_KEY` válida e atualizada para o ambiente do servidor, substituindo a chave defeituosa atual.

Passos:

1. **Vincular o conector ElevenLabs** ao projeto (sincroniza automaticamente uma `ELEVENLABS_API_KEY` válida no runtime do servidor).
2. **Validar a credencial** com uma verificação rápida (sem alterar dados), confirmando que a ElevenLabs não responde mais 401.
3. **Testar a geração de locução** numa obra do painel para confirmar que o áudio é gerado e salvo corretamente.

## Caso a vinculação não resolva

Se, após vincular, a ElevenLabs ainda recusar a chave (ex.: a chave do conector também estiver sem saldo/permissões), o caminho alternativo é gerar uma nova API key na sua conta ElevenLabs e atualizá-la como segredo do projeto. Nesse caso eu aviso e conduzo esse passo.

## Observações

- Nenhuma mudança visual ou de lógica de negócio é necessária — apenas a correção da credencial.
- A voz feminina atual e os parâmetros de entonação permanecem os mesmos.
