# Concluir a interface do histórico de versões (admin)

O backend já está pronto (tabela `obra_versoes`, registro automático em texto/áudio, e as funções `listarVersoes`, `restaurarVersaoTexto`, `restaurarVersaoAudio`). Falta apenas finalizar a UI em `src/routes/admin.tsx`.

## 1. Disparar o recarregamento do histórico

Nos handlers do card, chamar `recarregarHist()` nos sucessos:
- `handleSalvar` (texto salvo)
- `handleGerarTexto` (texto gerado pela IA)
- `handleRegenerar` (locução gerada)

Assim o histórico reflete cada nova geração/salvamento.

## 2. Componente `Historico`

Novo subcomponente em `admin.tsx`:
- Props: `num`, `refreshKey`, `onRestaurarTexto(texto)`, `onRestaurarAudio(versao)`.
- Seção recolhível **"Histórico"** (ícone `History`); ao abrir, chama `listarVersoes({ chave: num })`. Recarrega quando `refreshKey` muda.
- **Texto (até 3):** data/hora, etiqueta de origem (IA / manual), trecho do texto e botão **Restaurar** (ícone `RotateCcw`) → chama `restaurarVersaoTexto` e, em sucesso, `onRestaurarTexto(texto)` para preencher o textarea.
- **Áudio (até 3):** data/hora, origem, mini player de prévia (`/api/public/obra-audio/{num}?...`) e botão **Restaurar** → chama `restaurarVersaoAudio` e, em sucesso, `onRestaurarAudio(versao)` para atualizar o player atual.
- Estados de carregando/erro e "sem versões ainda".

## 3. Encaixe no card

Renderizar `<Historico />` antes do fechamento do card (`</li>`), passando `histKey` como `refreshKey`, `setTexto` em `onRestaurarTexto` e `setVersaoAudio` em `onRestaurarAudio`.

## Observações

- Apenas mudanças de frontend; nenhuma alteração de banco, RLS ou novas funções de servidor.
- Limite de 3 versões por tipo/obra é garantido no backend (poda automática).
