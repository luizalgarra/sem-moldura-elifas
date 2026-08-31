# Rede Além da Moldura — apontar para o backend deste site

A fusão das entradas (item 2 a 5 do seu texto) já está feita no preview: `/rede-alem-da-moldura` envia o formulário para `rede-inscrever`, abre a conversa na mesma página, `/entrar-na-rede` redireciona e `/continuar?t=…` tem tela própria de link inválido. O que falta é o endereço do banco e a limpeza.

## Situação verificada

- `src/lib/rede-backend.ts` ainda tem `https://ghtqfxjpgnjbdfjxfjhq.supabase.co` escrito à mão e lê uma chave publicável de uma variável separada (`VITE_REDE_SUPABASE_PUBLISHABLE_KEY`).
- `/guardiao` cria o cliente por essa mesma função, então também aponta para a réplica.
- Sobraram dois arquivos órfãos da versão anterior: `src/components/rede/EntrarNaRede.tsx` e `src/lib/rede.functions.ts` (esta última insere direto em `rede_lista_espera` com service_role — é justamente o segundo caminho de gravação que você pediu para não existir).
- As três funções (`rede-inscrever`, `rede-conversa`, `rede-saude`) ainda respondem 404 no projeto de produção deste site — ou seja, ainda não estão implantadas lá. O código fica pronto; o teste de ponta a ponta só roda depois da implantação.

## O que muda

1. **Endereço único.** `src/lib/rede-backend.ts` passa a usar a mesma configuração do site (`VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`, com o par de servidor como reserva). Some a constante com a URL escrita à mão, some a variável de chave própria da Rede e some o aviso "chave não configurada" no formulário.
2. **`/guardiao`** continua igual em comportamento; só passa a criar o cliente no projeto certo, mantendo `{ db: { schema: "rede" } }`, storageKey próprio, magic link e as cinco colunas de decisão.
3. **Limpeza.** Apago `src/components/rede/EntrarNaRede.tsx` e `src/lib/rede.functions.ts`, deixando `rede-inscrever` como única gravação.
4. **Conferência.** Rodo no preview: envio do formulário sem recarregar, envio repetido do mesmo e-mail, redirecionamento de `/entrar-na-rede`, `/continuar?t=qualquercoisa`, e uma busca final por `ghtqfxjpgnjbdfjxfjhq` no código. Enquanto as funções estiverem 404, o que dá para confirmar é a navegação e a mensagem de erro vinda do servidor; a conversa completa fica para depois da implantação.

Nada é publicado — tudo fica no preview.

## Detalhes técnicos

- Chamadas continuam POST com `Authorization: Bearer <chave publicável>` e `Content-Type: application/json`, para `/functions/v1/<função>`.
- `conversa_id` e `sessao` seguem em `sessionStorage` dentro de try/catch.
- Barra de progresso sem rótulo, botões `propor_ficha`, encerramento por `emitir_link_retomada` e mensagens de erro vindas do campo `erro` já estão implementados e não mudam.
- Vocabulário: "estrela"; nenhuma cifra na interface.
