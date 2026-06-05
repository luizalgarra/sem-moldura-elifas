## Objetivo

Manter no seletor de voz do painel admin apenas duas opções:
- **Sarah** (feminina, suave) — voz padrão atual
- **George** (masculina, madura)

Remover Alice, Brian e Daniel.

## O que muda

**`src/data/vozes.ts`** — único arquivo a ser alterado.
- Remover os objetos de Alice, Brian e Daniel do array `VOZES`, deixando apenas Sarah e George.
- `VOZ_PADRAO_ID` continua sendo o ID da Sarah.
- `vozValida()` passa a aceitar apenas os dois IDs restantes.

## Impacto

- O seletor em `src/routes/admin.tsx` lê de `VOZES` automaticamente, então passará a exibir só as duas opções — nenhuma alteração necessária ali.
- A validação em `regenerarAudio` (`src/lib/admin-obras.functions.ts`) já usa `vozValida()`, então qualquer voz fora das duas será rejeitada/cairá no padrão. Nenhuma alteração necessária.
- Obras que eventualmente já tenham sido geradas com Alice/Brian/Daniel mantêm o áudio salvo; só não será mais possível escolher essas vozes em novas regenerações.

Sem mudanças de banco de dados e sem nova chave de API.