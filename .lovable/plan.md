## Objetivo

Adicionar o logo "Caixa Cultural" no rodapé como abertura institucional, no topo do bloco de assinaturas, com a palavra "Apresenta" ao lado — fiel ao cartaz.

## Mudança

Arquivo único: `src/components/SiteFooter.tsx`

No bloco de assinatura institucional (fundo escuro, atualmente com os grupos **Realização** e **Patrocínio**), adicionar acima desses grupos uma nova linha de abertura:

```text
[ logo Caixa Cultural ]   Apresenta
─────────────────────────────────────
 Realização            Patrocínio
```

- Usar o asset já existente `marca.seloCaixaCultural` (já importado, hoje não utilizado).
- Layout: linha centralizada com o logo + texto "Apresenta" ao lado (alinhados na horizontal), com um pequeno espaçamento abaixo separando dos grupos Realização/Patrocínio.
- Tipografia do "Apresenta": usar token de cor `text-foreground/70` (off-white), tamanho discreto, coerente com as sobrelinhas existentes — sem cores fora dos tokens.
- Manter intactos os grupos Realização e Patrocínio e todo o restante do rodapé.

## Não muda

- Nenhuma rota, dado, lógica ou funcionalidade.
- Demais selos, ícones e informações da exposição permanecem como estão.

## Verificação

Conferir no preview (`/obras`) que o logo "Caixa Cultural Apresenta" aparece no topo do bloco escuro, acima de Realização/Patrocínio, com o texto "Apresenta" ao lado do logo.