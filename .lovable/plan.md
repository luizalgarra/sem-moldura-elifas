# Texto e locução da audiodescrição nas páginas de obra

As páginas `/obras/$num` (obra 1 em diante, até a última) já exibem o **player de locução** (`AudioDescricao`). O que falta é mostrar, **escrito**, o **texto da audiodescrição**.

## O que muda

Arquivo único: `src/routes/obras.$num.tsx`.

1. **Locução (player)** — permanece como está, logo acima. Sem alterações.

2. **Seção de texto** — a seção atual "Descrição" (que hoje mostra `obra.descricao`) passa a:
   - **Título**: "Audiodescrição" (no lugar de "Descrição").
   - **Conteúdo**: `obra.audiodescricao` (o mesmo texto usado na locução), no lugar de `obra.descricao`.
   - **Visibilidade condicional**: a seção só é renderizada quando a obra tem audiodescrição real — usando o campo `obra.temAudiodescricao` (já existente em `ObraAcervo`). Quando não houver audiodescrição gerada, a seção inteira é ocultada (nada de fallback para a descrição).

3. Como o texto pode ter parágrafos, ele será quebrado por linhas em branco e renderizado em múltiplos `<p>` para manter a leitura confortável.

## Detalhe técnico

- O loader já carrega o acervo via `listarAcervo()`, e `ObraAcervo` já inclui `audiodescricao` (string) e `temAudiodescricao` (boolean). Nenhuma mudança de servidor, dados ou banco é necessária.
- Trecho atual (linhas ~136-141):

```text
<section aria-labelledby="descricao-titulo">
  <h2>Descrição</h2>
  <p>{obra.descricao}</p>
</section>
```

passa a ser, em essência:

```text
{obra.temAudiodescricao && (
  <section aria-labelledby="audiodescricao-titulo">
    <h2>Audiodescrição</h2>
    {paragrafos.map(...) => <p>...</p>}
  </section>
)}
```

Nenhuma outra parte da página (imagem, ficha técnica, conexão com a linha do tempo, navegação) é alterada.