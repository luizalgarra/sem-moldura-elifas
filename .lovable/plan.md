# Imagens das obras para a IA — diagnóstico e correções

## O que foi descoberto

1. **Duas fontes de imagem independentes.** As obras fixas (1–117) mostram a imagem
   empacotada em `src/assets/obras/`, que nunca grava no banco. A coluna `imagem_path`
   só é preenchida quando o admin faz upload manual. Logo, "imagem visível" não
   significa `imagem_path` cadastrado — isso é esperado.

2. **A IA já usa a imagem estática.** A função `imagemDataUrl` já tem fallback: se não
   há `imagem_path`, ela busca a imagem estática da obra fixa. Funciona para quase tudo.

3. **O aviso só aparece quando as duas fontes falham.** Hoje, entre as obras fixas,
   isso ocorre apenas na **obra 30** (não existe `obra-30.jpg` nem `imagem_path`).

4. **Achado adicional:** os arquivos `.asset.json` das obras estão **desalinhados** —
   `obra-1.jpg.asset.json` aponta para `obra-115.jpg`, `obra-2`→`obra-1.jpg`, etc.
   Isso faz várias obras exibirem/enviarem para a IA a imagem de outra obra.

## O que será feito

### 1. Resolver a obra 30
- Opção A (preferida): o usuário fornece o arquivo da imagem da obra 30; subimos como
  asset estático (`src/assets/obras/obra-30.jpg`) — passa a aparecer no site e a IA
  consegue analisá-la.
- Opção B (provisória): se não houver a imagem, manter o aviso, mas deixá-lo mais
  claro (ver item 2).

### 2. Mensagem de aviso mais clara
Trocar "Esta obra não tem imagem cadastrada para a IA analisar." por algo que explique
o caminho: indicar que é preciso enviar a imagem da obra pela tela de edição (ou que a
obra ainda não tem arquivo de imagem disponível).

### 3. Corrigir o desalinhamento dos ponteiros de imagem
Investigar e corrigir os `.asset.json` em `src/assets/obras/` para que
`obra-N.jpg.asset.json` aponte de fato para a imagem da obra N. Isso conserta tanto a
exibição pública quanto o que a IA recebe. Requer confirmar a correspondência correta
(provavelmente recriar os ponteiros a partir das imagens originais).

## Detalhes técnicos

- Fallback da IA: `src/lib/admin-obras.functions.ts`, função `imagemDataUrl`
  (passo 2 já busca a imagem estática para obras fixas).
- Texto do aviso: `gerarTextoDescricao` na mesma file (linha ~927).
- Imagens estáticas: `src/data/obras.ts` lê `src/assets/obras/obra-N.jpg.asset.json`
  via `import.meta.glob`. A correção do item 3 mexe apenas nesses ponteiros.

## Fora de escopo
- Não muda o esquema do banco nem as regras de RLS.
- Não altera o pipeline de áudio.

## Decisão necessária do usuário
- Você tem a imagem da **obra 30** para enviarmos? E quer que eu corrija também o
  desalinhamento dos ponteiros (item 3), que é a causa mais provável de obras exibindo
  a imagem errada?
