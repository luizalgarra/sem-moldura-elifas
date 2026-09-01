# Configuração do agente Anfitrião (Rede Além da Moldura)

## Objetivo
Permitir que o admin configure **como o Anfitrião responde** sem mexer no código: personalidade/instruções, parâmetros de resposta, regras adicionais e modelo por etapa — tudo numa tela de admin. As ferramentas (gravar_bloco, emitir_link_retomada etc.) e a lógica de gravação no banco seguem fixas no código.

## O que fica configurável na tela vs. no código
- **Na tela (banco):** texto de personalidade/tom, regras extras (texto livre), temperatura, tamanho máximo da resposta, modelo para Etapa A, modelo para Etapa B, modelo de reserva (fallback).
- **No código:** definição das ferramentas, esquema de gravação, mapa de pendências e regras inegociáveis de segurança (dinheiro, menores, consentimento) — continuam fixas para não quebrar o fluxo.

## Passos

### 1. Banco de dados
Criar tabela `public.agente_config` (linha única, id=1) com colunas:
- `instrucoes` text — personalidade/tom extra (vai anexado ao prompt)
- `regras_extras` text — regras adicionais escritas pelo admin
- `temperatura` numeric (0–1, padrão 0.7)
- `max_tokens` integer (padrão 1024)
- `modelo_etapa_a` text, `modelo_etapa_b` text (vazio = usa o global de `ia_config`)
- `modelo_fallback` text (tentado se o principal falhar)
- `atualizado_em`, `atualizado_por`
- GRANT para `authenticated` e `service_role`; RLS com `is_admin()` (mesmo padrão de `ia_config`).

### 2. Servidor
- `src/lib/rede-anfitriao.server.ts`:
  - `modeloAtivo()` passa a resolver por etapa: config específica da etapa → senão o global de `ia_config`.
  - `montarPrompt()` anexa `instrucoes` e `regras_extras` ao final do prompt fixo.
  - Em caso de erro do provedor, tenta o `modelo_fallback` uma vez antes de desistir.
- `src/lib/ia-provedores.server.ts`:
  - `conversarCom()` aceita `temperatura` e `maxTokens` e os repassa para Anthropic, OpenAI, Google e NVIDIA (cada um no seu formato).

### 3. Funções de admin
Em `src/lib/ia-config.functions.ts` (todas com `requireSupabaseAuth` + `is_admin()`):
- `lerAgenteConfig()` — retorna a configuração atual.
- `salvarAgenteConfig()` — valida e grava (temperatura entre 0 e 1, max_tokens entre 256 e 4096, modelos existentes no catálogo).

### 4. Tela de admin
Nova rota `/agente` (link a partir de `/modelos`), protegida por `useAdminAuth`:
- Campo de texto "Personalidade e tom" (com o padrão atual visível como referência).
- Campo "Regras adicionais".
- Sliders/campos: temperatura, tamanho máximo da resposta.
- Seletores de modelo: Etapa A, Etapa B e Reserva (reusando o catálogo de `src/lib/ia-modelos.ts`).
- Botão **Testar**: envia uma frase de exemplo e mostra a resposta do agente com a configuração atual (sem gravar nada no banco da Rede).
- Aviso de que as regras de segurança (dinheiro, menores, consentimento) são fixas.

### 5. Validação
- Salvar uma configuração, rodar uma conversa de teste na `/rede-alem-da-moldura` e confirmar que as instruções e o modelo escolhido foram aplicados.
- Conferir o registro em `ia_uso` para ver o modelo efetivamente usado.

## Detalhes técnicos
- Migração segue o padrão do projeto: CREATE TABLE → GRANT → ENABLE RLS → POLICIES com `is_admin()`.
- Nenhuma chave de API é exposta; a tela só lê/escreve configuração, nunca segredos.
- Valores ausentes na tabela caem nos padrões atuais do código — o agente nunca fica sem prompt.
