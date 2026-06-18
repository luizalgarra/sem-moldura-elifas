## Objetivo
Na página `/admin`, remover a "caixa de vozes padrão" (amostras de Carla e Danilo), **mantendo** o botão de geração em lote ("Gerar locução alternada de todas as obras").

## O que muda em `src/routes/admin.tsx`
1. **Remover o bloco de amostras de voz**: o cabeçalho "Vozes padrão", o texto explicativo e a grade com os botões de "ouvir" (Carla / Danilo).
2. **Mover o botão "Gerar locução alternada de todas as obras"** para fora da caixa removida, deixando-o como um bloco próprio (mantendo o indicador de progresso "Gerando… x/y" e a mensagem de conclusão).
3. **Limpar o código órfão** que só servia às amostras:
   - constantes `VOZ_FEMININA_ID`, `VOZ_MASCULINA_ID`, `VOZES_PADRAO`, `cacheAmostras`
   - estados `amostraCarregando`, `amostraMsg`
   - função `handleAmostra`
   - import `amostraVoz` e `useServerFn(amostraVoz)`
   - ícone `Volume2` (se não usado em outro lugar)

A lógica de geração de áudio e a lista de obras permanecem iguais.

## Verificação
- Build passa sem variáveis/imports não usados.
- `/admin` abre sem a caixa de amostras, mas com o botão de gerar todas as obras funcionando e a busca + lista logo abaixo.

## Sobre a imagem que você enviou
A imagem é um print de **um card de obra** da própria página `/admin` — a obra **#8 "Capa nº1 Almanaque Brasil"**. Ela mostra a parte inferior da página (a lista de obras), com a caixa de texto da descrição e os três botões do card: **Salvar texto**, **Gerar locução alternada** e **Baixar 1º trecho**. Não é a "caixa de vozes padrão" — esta fica no topo da página, antes do campo de busca, e é o bloco que será removido.