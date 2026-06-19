# Separar descrição e texto da audiodescrição (locução do texto gerado)

Hoje existe **um único campo** `descricao` que faz tudo: é referência para a IA, é o que aparece no público e é a fonte da locução. Vamos separar em **dois conteúdos**:

- **Descrição (referência)** — texto factual/curatorial, editável manualmente. Continua em `descricao`.
- **Texto da audiodescrição (gerado)** — narrativa fluida e coloquial que a IA produz **integrando a descrição de forma natural**. Fica em uma nova coluna `audiodescricao`. É **este** texto que vira a locução.

Fluxo final no admin de cada obra:
1. Admin escreve/ajusta a **Descrição (referência)**.
2. Botão **Gerar audiodescrição (IA)** → a IA usa a imagem + a descrição e devolve a narrativa coloquial no campo **Texto da audiodescrição**.
3. Admin **revisa e edita** essa narrativa e salva.
4. Botão **Gerar locução** → TTS a partir do **texto da audiodescrição** (não mais da descrição).

Na página pública aparecem **os dois**: a Descrição (referência) e o texto da audiodescrição (que é o mesmo da locução).

```text
Descrição (referência)  ──┐
                          ├─► IA gera ──► Texto da audiodescrição ──► Locução (TTS)
Imagem da obra          ──┘                 (editável, versionado)
```

## 1. Banco de dados (migração)

Adicionar coluna `audiodescricao text` em `obra_overrides` e `obras_extras`.

Migração de dados única (via tool de insert, após a migração de schema): copiar o conteúdo atual de `descricao` para `audiodescricao` nas linhas existentes, para que as obras já cadastradas mantenham o texto que hoje vira locução enquanto a `descricao` passa a ser a referência.

A tabela `obra_versoes` já guarda versões de texto na coluna `descricao` (genérica) — o versionamento passa a registrar o **texto da audiodescrição**. Sem mudança de schema em `obra_versoes`.

## 2. Backend (`src/lib/admin-obras.functions.ts`)

- **`OverrideObra` / `ObraAcervo`**: incluir o campo `audiodescricao`. Em `construirAcervo`, `listarOverrides` e `getObraPublica`, ler e expor a nova coluna (fallback para `descricao` quando vazia, para obras ainda não migradas).
- **`gerarTextoDescricao`**: manter imagem + `descricao` como entrada, ajustar o prompt para produzir a **narrativa coloquial integrando a descrição de forma natural e fluida à audiodescrição** (sem rótulos/markdown). Passa a registrar a versão como o texto da audiodescrição (sem gravar direto na obra — continua voltando para revisão).
- **Nova `salvarAudiodescricao`** (espelho de `salvarTexto`): grava em `audiodescricao` e registra versão `tipo: "texto"`. `salvarTexto` continua gravando a **descrição (referência)** mas deixa de registrar versão de texto (versão de texto passa a ser só da audiodescrição).
- **`regenerarAudio`**: ler **`audiodescricao`** em vez de `descricao`. Se estiver vazia, retornar erro claro ("Gere o texto da audiodescrição antes de gerar a locução."). A geração em lote (`handleLote`) segue chamando a mesma função.
- **`restaurarVersaoTexto`**: passar a regravar em `audiodescricao` (já que versão de texto agora representa a narrativa).

## 3. Admin UI (`src/routes/admin.tsx`)

No card de cada obra (`ObraEditor`):
- **Dois campos**: textarea "Descrição (referência)" (estado `descricao`) e textarea "Texto da audiodescrição (locução)" (estado `audiodescricao`).
- Botão **Salvar descrição** → `salvarTexto`. Botão **Salvar audiodescrição** → `salvarAudiodescricao`.
- **Gerar audiodescrição (IA)** preenche o campo da narrativa (não a descrição).
- **Gerar locução** usa o texto da audiodescrição; mensagem de erro se vazio.
- Histórico (versões de texto) continua restaurando para o campo da audiodescrição via `onRestaurarTexto`.

## 4. Página pública (`src/routes/obras.$num.tsx`)

- `AudioDescricao` recebe `texto={obra.audiodescricao}` (o mesmo texto da locução).
- Seção "Descrição" continua mostrando `obra.descricao` (referência).
- Assim os **dois textos** aparecem, conforme pedido.

## Observações

- Limite de 3 versões por tipo/obra continua garantido no backend.
- Sem novas dependências; TTS segue na ElevenLabs já configurada.
- Obras antigas: o copy de `descricao → audiodescricao` evita locuções vazias até alguém regenerar.
