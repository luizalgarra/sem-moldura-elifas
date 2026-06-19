## Problema

Ao clicar em **"Gerar audiodescrição (IA)"**, o botão fica girando e para sem gerar texto. A geração usa o modelo `google/gemini-2.5-pro` analisando a imagem da obra. Esse é o modelo mais lento e, somado à análise de imagem, a chamada frequentemente ultrapassa o tempo limite do servidor — a requisição é interrompida e o texto nunca volta. Verifiquei que o gateway de IA e a autenticação estão funcionando normalmente; o gargalo é o tempo da chamada.

## Correção

Em `src/lib/admin-obras.functions.ts`, dentro de `gerarTextoDescricao`:

1. **Trocar o modelo por um mais rápido com visão**: usar `google/gemini-3-flash-preview` no lugar de `google/gemini-2.5-pro`. Ele analisa imagem e texto com qualidade boa e responde muito mais rápido, eliminando o estouro de tempo. A mesma instrução (prompt) é mantida, então a qualidade do texto continua alta.

2. **Adicionar um tempo limite explícito com mensagem clara**: envolver o `fetch` num `AbortController` (por exemplo, ~90s). Se mesmo assim demorar demais, retornar uma mensagem amigável ("A geração demorou mais que o esperado. Tente novamente.") em vez de o botão simplesmente parar de girar sem explicação.

3. **Mensagem de erro mais explícita no admin**: garantir que, quando a geração falhar ou expirar, a mensagem apareça de forma visível ao lado do botão (já existe o `msg`, apenas confirmar que o caso de timeout cai nele).

## Resultado esperado

Clicar em "Gerar audiodescrição (IA)" passa a retornar o texto em poucos segundos. Caso ocorra qualquer falha, uma mensagem clara é exibida em vez de o botão girar e parar silenciosamente.

## Observação

Se você preferir manter a maior capacidade de análise do `gemini-2.5-pro` mesmo correndo risco de lentidão, posso, em vez de trocar o modelo, converter a geração para um processo em segundo plano (gera e avisa quando ficar pronto). Isso é mais robusto, porém mais trabalhoso. Me diga se prefere essa abordagem.