# Redesenho da página /admin

Objetivo: deixar o painel interno (`/admin`) mais claro e fácil de usar, com uma identidade visual própria de "painel de controle" — separada da paleta do site público. Apenas a página `/admin` muda; nenhuma outra rota é tocada.

## Princípios
- Sem mudar nenhuma lógica, server function, fluxo de geração de áudio/texto, histórico ou aprovação.
- Mexer só na camada de apresentação (JSX/classes) dentro de `src/routes/admin.tsx`.
- Paleta própria do admin via tokens locais (escopados ao container do admin), para não interferir no tema do site.

## Mudanças visuais

### 1. Tema do painel (paleta própria)
- Definir um conjunto de tokens próprios do admin (fundo neutro escuro/grafite, superfície de cards levemente elevada, cor de destaque distinta da do site, e cores de status). Aplicados via uma classe wrapper no container raiz do admin, sem afetar o resto do app.
- Codificação de status por cor consistente:
  - Sem gerar → cinza neutro
  - Texto gerado → âmbar
  - Locução gerada → azul
  - Aprovada → verde

### 2. Cabeçalho e barra de ações
- Cabeçalho mais compacto com título + subtítulo e, à direita, as ações em lote ("Gerar locução de todas" e "Cadastrar imagens"). Mensagens de progresso/resultado com aparência de badge.

### 3. Card de consumo (ElevenLabs)
- Reorganizar as 3 métricas (Caracteres, Gerações, Custo estimado) em cards com hierarquia mais forte (número grande, rótulo discreto, ícone). Detalhamento por obra mantido em `details`, com melhor leitura.

### 4. Toolbar de busca/filtros
- Manter sticky, mas com visual mais limpo: campo de busca com destaque e filtros como "chips" com contagem, usando as cores de status.

### 5. Lista de obras (ObraEditor)
- Cada obra como um card mais legível: cabeçalho com número/título e badge de status colorido; seções "Descrição (referência)" e "Texto da audiodescrição" com rótulos claros e melhor espaçamento.
- Agrupar as ações de cada bloco e dar destaque às primárias (Salvar / Gerar), com as secundárias em estilo discreto.
- Player de locução e checkbox "Aprovar" em uma faixa destacada quando há áudio.
- Bloco de Histórico com visual mais leve (itens com melhor contraste e densidade).

## Detalhes técnicos
- Editar somente `src/routes/admin.tsx` e, se necessário para os tokens próprios, adicionar um pequeno bloco escopado em `src/styles.css` (classe `.admin-theme` com variáveis em `oklch`), sem alterar tokens globais existentes.
- Nenhuma alteração em server functions, hooks, dados ou rotas.
- Verificação: capturar a tela do `/admin` após o login não é possível automaticamente (exige sessão), então a validação será por build limpo e revisão do JSX.

Sem mudanças funcionais — apenas aparência.