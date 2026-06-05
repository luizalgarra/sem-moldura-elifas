## Objetivo

Permitir baixar o arquivo de áudio (.mp3) de cada obra listada no painel `/admin`, com um botão de download em cada item.

## Como funciona hoje

- O painel lista cada obra fixa (`src/routes/admin.tsx`).
- O player de áudio só aparece quando existe um áudio **regenerado** (`audioSrc` via `/api/public/obra-audio/:num`).
- Cada obra fixa também tem um áudio **estático** original (`obra.audio`), que hoje não é exposto no admin.

## Mudanças (apenas `src/routes/admin.tsx`)

1. Passar o áudio estático para o editor: na lista, adicionar `audioEstatico={obra.audio}` ao componente `ObraEditor` e receber essa prop.

2. Calcular a fonte de download para cada obra:
   - Se houver áudio regenerado → usar `/api/public/obra-audio/:num?v=…`.
   - Senão, se houver áudio estático → usar `obra.audio`.
   - Se não houver nenhum dos dois → não mostrar o botão de download.

3. Adicionar um botão de **Baixar áudio** na barra de ações de cada obra, ao lado de "Salvar texto"/"Regenerar áudio":
   - Renderizado como um link (`<a>`) com atributo `download="obra-<num>.mp3"` apontando para a fonte de download, estilizado como botão (variante `outline`, usando o ícone `Download` de `lucide-react`).
   - Desabilitado/oculto quando não há áudio disponível.

## Detalhes técnicos

- Importar o ícone `Download` de `lucide-react`.
- O atributo `download` força o navegador a salvar o arquivo. Como a rota `/api/public/obra-audio/:num` é do mesmo domínio, o `download` funciona normalmente; o áudio estático também é servido do mesmo domínio (asset).
- Sem alterações de banco de dados, server functions ou novas chaves de API.
- A obra protegida (#2) também ganha o download do seu áudio especial estático, já que `obra.audio` existe para ela.
