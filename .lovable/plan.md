## Objetivo

Substituir os logos institucionais separados (montados em grid com textos "Realização"/"Patrocínio"/"Apresenta") pelas 3 barras prontas dos PSDs, mantendo o fundo preto original das imagens.

## Imagens novas (do PSD, fundo preto)

| Arquivo PSD | Conteúdo | Onde aplicar |
|---|---|---|
| Logo_Caixa Cultural Apresenta | CAIXA CULTURAL + "apresenta" | Cabeçalho |
| Barra logos_Realização | "Realização" + SECOM + Instituto Elifas | Rodapé |
| Barra logos_Patrocínio | "Patrocínio" + CAIXA + Governo do Brasil | Rodapé |

## Passos

1. **Converter e subir os PSDs como assets PNG** (camada achatada, fundo preto) via `lovable-assets`, gerando 3 novos `.asset.json` em `src/assets/marca/`:
   - `barra-caixa-cultural-apresenta.png`
   - `barra-realizacao.png`
   - `barra-patrocinio.png`

2. **Registrar em `src/assets/marca/index.ts`** as 3 novas entradas.

3. **`SiteHeader.tsx`** — substituir o bloco atual (selo `seloCaixaCultural` + texto "Apresenta") pela imagem única `barra-caixa-cultural-apresenta`, mantendo o link para a home e a logo "Além da Moldura" ao lado.

4. **`SiteFooter.tsx`** — substituir toda a assinatura institucional (o grid com `seloSecom`, `seloInstitutoElifas`, `seloCaixa`, `seloGovernoBrasil` e os textos "Realização"/"Patrocínio") pelas duas barras únicas `barra-realizacao` e `barra-patrocinio`, lado a lado em telas largas e empilhadas no mobile. Como as barras já têm fundo preto e os rótulos embutidos, o bloco fica mais simples.

5. **Limpeza opcional**: os assets antigos que deixarem de ser usados (`selo-caixa-cultural`, `selo-secom`, `selo-instituto-elifas-andreato`, `selo-caixa`, `selo-governo-brasil`) podem ser removidos depois. Manterei por segurança nesta etapa, removendo apenas as referências no header/rodapé.

## Detalhes técnicos

- As imagens têm fundo preto sólido; serão usadas como estão (sem transparência), sobre o fundo escuro do site, garantindo contraste do bloco institucional.
- Alt text descritivo em cada imagem para acessibilidade (já que os logos vêm embutidos na barra).
- Sem mudanças de lógica/backend — apenas apresentação (header/footer e assets).
