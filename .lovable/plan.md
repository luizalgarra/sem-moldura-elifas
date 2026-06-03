
# Catálogo Virtual — Elifas Andreato: Sem Moldura (80 anos)

Site público, acessível, em português, com acesso via QR Code por obra. Base: planilha com **85 obras** + pacote de imagens (por enquanto **20 de 85**, Img_01–Img_20).

## Dados confirmados
Cada obra: nº de impressão, título de catálogo, ano, técnica, dimensão do original, parede e arquivo de imagem.
Por parede: **Parede 1 (10), Parede 2 (27), Parede 3 (47), Trainel Martinho (1)**.

## Decisões aprovadas
- **Imagens:** as 20 enviadas entram já; obras sem imagem mostram placeholder e são trocadas quando você enviar Img_21–Img_85.
- **Áudio-descrição:** voz sintética (Web Speech API). Texto gerado da ficha — ex.: *"Obra: Equus. Elifas Andreato, 1975. Técnica: acrílica e lápis sobre tela. Dimensão do original: 40 por 30 centímetros."* Fácil de enriquecer depois.
- **Organização:** acervo agrupado por Parede, na ordem do plano expográfico.

## Telas / Rotas
1. `/` — Abertura: título da exposição, texto curatorial breve, atalhos "Ver acervo" e "Como usar".
2. `/obras` — Acervo: seções por Parede, grade de miniaturas (título + ano), busca por título.
3. `/obras/$num` — Página da obra (destino do QR): imagem em destaque (toque amplia), ficha, **player de áudio-descrição** (ouvir/pausar/reiniciar/velocidade), texto visível, navegação Anterior/Próxima ("Obra X de 85"), link ao acervo.
4. `/como-usar` — QR Code + recursos de acessibilidade.
5. `/qrcodes` — Lista todas as obras com link `/obras/{num}` e QR Code na tela, para impressão.
6. Página 404 amigável.

## Acessibilidade
Alto contraste WCAG AA; aumentar/diminuir fonte e alternar alto contraste; alt descritivo; teclado e foco visível; alvos ≥ 44px; hierarquia de cabeçalhos; único `<main>`; `lang="pt-BR"`.

## Identidade visual
Galeria sóbria e editorial: muito espaço em branco, tipografia grande, fundo claro de alto contraste e destaque quente terracota/ocre. Mobile-first (acesso por QR). Tokens em `src/styles.css` (oklch).

## Técnico
- Rotas TanStack em `src/routes/`; dados em `src/data/obras.ts` (85 obras tipadas, geradas da planilha).
- Imagens das 20 obras como assets do projeto (CDN), referenciadas por obra.
- Componentes: `ObraCard`, `AudioDescricao`, `ControlesAcessibilidade`, `NavegacaoSequencial`, `QrCode`, cabeçalho/rodapé.
- SEO por rota; imagens `loading="lazy"`. Sem backend/login nesta fase.

## Fora de escopo
Login, painel admin, voz sintética premium (TTS externo) — evoluções futuras.
