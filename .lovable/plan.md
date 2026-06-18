## Objetivo
Você removeu a voz masculina, mas vários textos da interface ainda dizem que a locução "alterna" entre voz masculina e feminina por seção. Vou corrigir esses textos para refletir o comportamento real: **apenas uma voz (feminina)**.

## O que muda

### 1. `src/routes/admin.tsx` (página /admin)
- **Cabeçalho:** o parágrafo atual diz "A leitura alterna as vozes por seção: Audiodescrição (masculina) → Identificação (feminina) → Contexto (masculina) → Análise (feminina)." Será trocado por um texto simples: editar a descrição e gerar a locução (voz única).
- **Botão de lote:** "Gerar locução alternada de todas as obras" → "Gerar locução de todas as obras".
- **Mensagem de conclusão do lote:** "…obras com locução alternada gerada." → "…obras com locução gerada."
- **Botão de cada card:** "Gerar locução alternada" → "Gerar locução".
- **Mensagem do card:** "Locução alternada gerada (x trechos)." → "Locução gerada (x trechos)."
- **Rótulo dos trechos:** hoje mostra "masculina (Danilo)" / "feminina (Carla)". Como tudo é voz feminina, passará a mostrar apenas o rótulo do trecho (sem indicação de voz masculina/feminina).

### 2. `src/components/AudioDescricao.tsx` (player público)
- Texto "Locução alternada · N trechos (vozes se revezam)" → "Áudio-descrição · N trechos".
- Ao tocar, remover o sufixo de voz ("voz feminina/masculina") já que é sempre a mesma voz — manter apenas "Tocando x/y: rótulo".

## O que NÃO muda
- A lógica de geração de áudio, divisão em trechos e reprodução continua igual.
- O botão de geração em lote permanece (apenas o texto muda).
- A obra protegida (#2) continua preservada.

## Verificação
- Build passa sem variáveis/imports não usados.
- `/admin` e a página pública de obra não mencionam mais alternância de vozes nem voz masculina.

Confirme que prefere **apenas ajustar os textos** (sem reativar a voz masculina). Se preferir reativar a alternância de vozes, me avise que faço outro plano.