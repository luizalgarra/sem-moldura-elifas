## Objetivo

Remover do bucket `audios-obras` os arquivos de áudio que **não** estão referenciados em `obra_overrides.audio_fem_path` (nem em `audio_trechos`, que hoje está vazio), mantendo apenas a versão atual de cada obra.

## Arquivos a manter (referenciados)
- `obra-1-fem-1781889003385.mp3`
- `obra-2-fem-1781894092421.mp3`
- `obra-3-fem-1781894314791.mp3`
- `obra-4-fem-1781807487798.mp3`

## Arquivos órfãos a remover (8)
- `obra-1-1780544736397.mp3`
- `obra-1-fem-1781821039694.mp3`
- `obra-1-fem-1781879940502.mp3`
- `obra-1-fem-1781886838952.mp3`
- `obra-1-fem-1781887375921.mp3`
- `obra-4-t0-fem-1781805748260.mp3`
- `obra-4-t1-fem-1781805748261.mp3`
- `obra-4-t2-fem-1781805748261.mp3`
- `obra-4-t3-fem-1781805748261.mp3`

(Total a remover: 9 arquivos — recontagem dinâmica no momento da execução; libera ~7 MB.)

## Como será feito
- Script único e descartável executado no ambiente do servidor, usando a **API de Storage** com `SUPABASE_SERVICE_ROLE_KEY` + `SUPABASE_URL` (remoção real dos bytes, não apenas metadados).
- O script lista o conteúdo atual do bucket, lê os caminhos referenciados no banco, calcula o conjunto de órfãos **dinamicamente** (não usa lista fixa) e chama `POST /storage/v1/object/audios-obras` com a ação de remoção apenas para os órfãos.
- Salvaguarda: nunca remove um arquivo cujo nome conste em `audio_fem_path`/`audio_trechos`.

## Verificação
- Após a remoção, listar novamente o bucket e confirmar que restam exatamente os 4 arquivos referenciados.
- Nenhuma alteração de código de aplicação, banco ou rotas — apenas limpeza de arquivos no storage.