# Redesign visual — Elifas Andreato · Além da Moldura

Aplicar a identidade oficial da exposição em todo o app, **mudando apenas a aparência**. Nenhuma rota, dado, server function ou lógica (catálogo, áudio-descrição, QR Code, `/editar`) será alterada — só estilos, textos de marca, fontes e imagens.

## Nota técnica importante
O projeto roda em **Tailwind v4**, então **não existe `src/index.css` nem `tailwind.config.js`**. Os tokens de tema vivem em `src/styles.css` (bloco `:root` + `@theme inline`). Vou aplicar exatamente os tokens pedidos nesse arquivo, no formato HSL (`hsl(...)`), e mapeá-los para as utilities (`bg-primary`, `text-accent`, etc.). Funcionalmente é equivalente ao que foi descrito.

## 1. Imagens (Lovable Assets / CDN)
Subir as 14 imagens do zip via `lovable-assets` e gerar os pointers `.asset.json` em `src/assets/marca/`:
logo-firma-branco/preto, hero-elifas-arte, retrato-elifas-foto, textura-oleo, favicon, og-image, e os selos (caixa-cultural, caixa, governo-brasil, instituto-elifas-andreato, secom, icone-classificacao, icone-acessibilidade). Os binários não ficam no repositório.

## 2. Nome do app
Trocar em todo lugar **"Sem Moldura" → "Além da Moldura"** (nome oficial: "Elifas Andreato — Além da Moldura"):
- `__root.tsx`: `<title>`, description, og/twitter (título e descrição novos), `og:image` → og-image.jpg do CDN, favicon → favicon.png.
- `index.tsx`, `SiteHeader`, `SiteFooter`, `como-usar`, `qrcodes`, `obras.$num`, `obras.index`: textos e metadados.

## 3. Tema escuro (tokens) — `src/styles.css`
Substituir o `:root` atual pelos tokens da marca (em HSL):
- background `240 6% 5%`, foreground `60 6% 92%`, card/popover `240 6% 9%`, primary `228 88% 33%` (ultramar), accent `39 89% 49%` (âmbar), destructive `2 90% 44%`, secondary/muted `240 5% 14%`, border `240 5% 18%`, input `240 5% 16%`, ring `228 90% 52%`, radius `0.5rem`.
- Tokens de marca extras: `--brand-ultramar/red/yellow/amber/turquoise/deepblue`, mapeados em `@theme inline` para virarem classes (`text-brand-yellow`, etc.).
- Fundo do app sempre preto, cartões em `--card`, texto em `--foreground`. Manter `.dark` coerente. Ajustar o bloco `.alto-contraste` para continuar funcionando sobre o novo tema.

## 4. Tipografia — Source Sans 3
- Adicionar Source Sans 3 (300/400/600/700) via `<link>` no `head` do `__root.tsx` (não usar `@import` de URL em CSS — quebra o build no Tailwind v4).
- Em `src/styles.css`, apontar **`--font-sans` e `--font-serif`** para Source Sans 3, de modo que as classes `font-serif` já existentes nos títulos passem a usar Source Sans 3 sem precisar editar cada arquivo. Remover o import do Playfair.

## 5. Telas
- **Header (`SiteHeader`)**: fundo preto, `logo-firma-branco.png` à esquerda (com `alt`), navegação off-white, foco visível ultramar. Some o texto-logo atual.
- **Hero (`index.tsx`)**: fundo preto com `hero-elifas-arte.jpg` sangrando + overlay preto p/ legibilidade; sobrelinha "EXPOSIÇÃO · 80 ANOS" em `text-brand-yellow`; título off-white grande; subtexto; CTAs mantidos ("Ver o acervo" primário ultramar, "Como usar o QR Code" contorno). Textura de óleo sutil nas seções abaixo (baixa opacidade).
- **Cards de obra (`ObraCard`)**: `bg-card`, imagem no topo, título peso 600, ano em `text-muted-foreground`, hover com leve elevação + filete de acento (âmbar/ultramar).
- **Página da obra (`obras.$num`)**: imagem grande; metadados (Autor/Técnica/Dimensão/Parede) com rótulos discretos; descrição legível (largura ~70ch); player de áudio-descrição proeminente; bloco de QR. Só estilo.
- **`AudioDescricao`**: botão de play destacado (ultramar) e realce âmbar; manter toda a lógica.
- **`/editar`**: mesmo tema escuro; inputs escuros com foco ultramar; botões — Salvar = primário ultramar, Regenerar áudio = âmbar, Remover/Apagar = `destructive`. Sem mudar comportamento.
- **Rodapé (`SiteFooter`)**: faixa clara com os selos coloridos (caixa-cultural, caixa, governo-brasil, secom) + ícones classificação/acessibilidade; selo do Instituto (branco) dentro de um chip escuro. Acima: linha "Realização Instituto Elifas Andreato · Patrocínio Caixa / Governo do Brasil" e os dados: Caixa Cultural São Paulo · Praça da Sé, 111 — Centro · 27/06 a 20/09/2026 · ter–dom 9h–18h · Entrada franca.

## 6. Acessibilidade (WCAG AA)
- Manter/garantir: "pular para o conteúdo" (já existe), landmarks, foco visível ultramar em todos os interativos, alvos ≥44px, `alt` em todas as imagens novas, `aria-label` no player e no QR, respeito a `prefers-reduced-motion`, botão de aumentar texto (já existe em `ControlesAcessibilidade`).
- Regras de cor: ultramar só como fundo/forma (nunca texto sobre preto); vermelho só em título grande/ação destrutiva; texto em off-white/amarelo/âmbar/turquesa/cinza.

## 7. Restrições respeitadas
Sem usar "Sem Moldura"; fonte exclusivamente Source Sans 3; nenhuma cor crua fora dos tokens; nenhuma alteração de dados/rotas/funcionalidades.

## Arquivos afetados (apenas apresentação)
`src/styles.css`, `src/routes/__root.tsx`, `src/routes/index.tsx`, `src/components/SiteHeader.tsx`, `src/components/SiteFooter.tsx`, `src/components/ObraCard.tsx`, `src/components/AudioDescricao.tsx`, `src/routes/obras.$num.tsx`, `src/routes/obras.index.tsx`, `src/routes/como-usar.tsx`, `src/routes/qrcodes.tsx`, `src/routes/editar.tsx`, `src/components/QrCode.tsx` (estilo), e novos pointers em `src/assets/marca/*.asset.json`.

## Verificação
Conferir build limpo, inspeção visual de home, card, página de obra, `/editar` e rodapé (tema escuro, logo branco, selos), e checagem de contraste/foco.
