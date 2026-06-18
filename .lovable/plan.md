# Liberar regeneração da obra protegida (#2)

Hoje a obra #2 é tratada como "áudio especial preservado": no `/admin` ela não tem botões de gerar audiodescrição (IA) nem gerar locução, mostra apenas o cadeado "Áudio especial preservado", e o servidor recusa regenerar. Esta mudança remove essa proteção, deixando a obra #2 igual às demais.

## Como vai ficar para você

A obra #2 passa a exibir os mesmos botões das outras:
- **Gerar audiodescrição (IA)**
- **Gerar locução**
- **Salvar texto** e **Baixar áudio**

O cadeado "Áudio especial preservado" deixa de aparecer.

## Alterações técnicas

### 1. `src/lib/admin-obras.functions.ts`
- Em `regenerarAudio`, remover o bloqueio que retorna "Esta obra tem áudio especial e não pode ser regenerada aqui." (linhas 989–994), permitindo que a #2 gere voz normalmente.
- A constante `OBRA_PROTEGIDA` deixa de ser usada nessa função (pode ser mantida ou removida — não há outro uso no servidor).

### 2. `src/routes/admin.tsx`
- Remover a constante/uso `OBRA_PROTEGIDA` para que `protegida` nunca seja verdadeiro:
  - Botão **"Gerar audiodescrição (IA)"** passa a aparecer também na #2.
  - Substituir o ramo do cadeado "Áudio especial preservado" pelo botão **"Gerar locução"** (igual às demais obras).
  - O contador da geração em lote (`Gerar locução de todas as obras`) passará a incluir a #2.

## O que NÃO muda
- Geração de voz (ElevenLabs, locução única), IA de audiodescrição, players, upload de imagem, ordenação e todas as outras obras seguem iguais.

## Observação
- O áudio atual da #2 (de duas vozes unidas) será substituído assim que você clicar em gerar locução. Antes disso, nada é alterado — a regeneração só ocorre quando você acionar.
