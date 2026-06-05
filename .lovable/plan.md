## Objetivo

Tornar **Carla (Conversacional)** a voz feminina padrão da áudio-descrição.

## O que muda

Editar apenas `src/data/vozes.ts`:

- Alterar `VOZ_PADRAO_ID` de Fernanda (`KHmfNHtEjHhLK9eER20w`) para Carla Conversacional (`7eUAxNOneHxqfyRS77mW`).
- Mover Carla (Conversacional) para o topo da lista de vozes brasileiras, para aparecer primeiro no seletor.

Nenhuma mudança de banco, API ou outra tela. `vozValida()` continua igual.
