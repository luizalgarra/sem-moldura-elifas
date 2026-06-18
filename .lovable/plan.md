# Gerar audiodescrição com IA (imagem + texto)

Hoje o botão **Gerar locução** só converte o texto em voz. Esta mudança adiciona uma etapa anterior: a IA **olha a imagem do quadro**, interpreta, funde com a descrição que já existe e cria uma audiodescrição única. Você **revisa o texto** antes de salvar e gerar a voz.

## Como vai funcionar para você

Em cada obra no `/admin`:

1. Clica em **Gerar audiodescrição (IA)**.
2. A IA lê a imagem da obra + o texto atual e escreve uma audiodescrição unificada.
3. O texto aparece no campo de edição com a mensagem "Texto gerado — revise e salve".
4. Você ajusta o que quiser, clica em **Salvar texto** e depois em **Gerar locução** (voz).

A IA **nunca salva sozinha** — você sempre revisa antes.

## Alterações técnicas

### 1. `src/lib/admin-obras.functions.ts` — nova função `gerarTextoDescricao`
- `createServerFn({ method: "POST" })`, valida `{ chave }`.
- Descobre a imagem da obra: se houver `imagem_path` (override), baixa do bucket privado e converte para data URL base64; senão usa a URL pública estática (`obra.imagem`).
- Lê a descrição atual (override salvo → texto estático).
- Chama o **Lovable AI Gateway** com `google/gemini-2.5-pro` (multimodal):
  - **system**: instruções de audiodescrição acessível (descrever o que se vê, integrar com o contexto/descrição, tom adequado para pessoas com deficiência visual, em português).
  - **user**: texto da descrição atual + bloco de imagem (`image_url`).
- Retorna `{ ok: true, texto }` ou `{ ok: false, erro }`. **Não grava no banco.**
- Trata erros 402 (créditos) e 429 (limite) com mensagens claras.

### 2. `src/routes/admin.tsx` — UI de revisão
- Em `ObraEditor`: novo estado `gerandoTexto` e `useServerFn(gerarTextoDescricao)`.
- Botão **"Gerar audiodescrição (IA)"** (oculto na obra protegida #2) que chama a função e, em sucesso, faz `setTexto(textoGerado)` e mostra "Texto gerado — revise e salve."
- Nenhuma mudança no botão de voz nem no player.

## O que NÃO muda
- Geração de voz (locução única já implementada), players, upload/preview de imagem, ordenação, obra protegida #2.

## Observações
- Usa Lovable AI (sem chave extra); cada geração consome créditos do workspace.
- Obras sem imagem cadastrada usarão a imagem estática; se não houver nenhuma, o botão informa que não é possível gerar.
