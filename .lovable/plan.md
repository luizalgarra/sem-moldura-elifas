## Objetivo
Atualizar a configuração de seções em `src/lib/admin-obras.functions.ts` para:
1. **Remover a voz masculina** — todas as seções passam a usar a voz feminina (Carla).
2. **Remover a seção "Contexto"** (com as chaves `contexto historico e cultural`, `contexto historico`, `contexto cultural`, `contexto`).

## Como fica o `SECOES`
Passa de 4 para 3 seções, todas com voz feminina:

| # | Rótulo | Voz |
|---|---|---|
| 1 | Audiodescrição | fem |
| 2 | Identificação | fem |
| 3 | Análise | fem |

```ts
const SECOES: SecaoDef[] = [
  {
    chaves: [
      "audiodescricao",
      "audio descricao",
      "audiodescricao da obra",
      "descricao da imagem",
    ],
    rotulo: "Audiodescrição",
    voz: "fem",
  },
  {
    chaves: ["identificacao da obra", "identificacao"],
    rotulo: "Identificação",
    voz: "fem",
  },
  {
    chaves: ["analise interpretativa", "analise"],
    rotulo: "Análise",
    voz: "fem",
  },
];
```

## Fallback
Ajustar para refletir 3 seções, todas femininas:

```ts
const VOZES_FALLBACK: VozTipo[] = ["fem", "fem", "fem"];
const ROTULOS_FALLBACK = ["Parte 1", "Parte 2", "Parte 3"];
```

## Detalhes técnicos
- Arquivo único alterado: `src/lib/admin-obras.functions.ts`.
- Apenas a configuração de seções/fallback muda; a lógica de divisão de texto e geração de áudio permanece igual.
- Após a mudança, novas locuções geradas usarão somente a voz feminina e não terão mais a seção de Contexto. Áudios já gerados anteriormente não são afetados até serem regerados (obra #2 permanece protegida).

## Verificação
- Conferir que o build passa (sem referências quebradas a 4 seções).
- Abrir `/admin`, gerar locução de uma obra de teste e confirmar 3 trechos, todos em voz feminina, sem "Contexto".
