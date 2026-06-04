## Objetivo

Reestruturar o grupo "Realização" no rodapé para que o rótulo "REALIZAÇÃO" fique centralizado **diretamente sobre o logo do IEA** (formando um conjunto), com o selo SECOM como item irmão à esquerda, alinhado pela base e **sem rótulo** — fiel ao cartaz.

## Mudança (apenas `src/components/SiteFooter.tsx`)

Hoje o grupo Realização tem um único `<span>REALIZAÇÃO</span>` acima dos dois logos juntos. Será trocado para:

```text
<div flex items-end gap-4>          ← linha base alinhada
  <img SECOM />                     ← sem rótulo
  <div flex-col items-center gap-3> ← conjunto IEA
     <span>REALIZAÇÃO</span>        ← centralizado sobre o IEA
     <img IEA />
  </div>
</div>
```

O `<span>` de "REALIZAÇÃO" perde o `text-right` e passa a `text-center`, pois agora fica centralizado sobre o logo do IEA.

O grupo "Patrocínio" permanece intacto. Nenhum dado, rota ou lógica é alterado — somente o agrupamento visual.

## Verificação

Conferir no preview que "REALIZAÇÃO" aparece centralizado sobre o IEA e o SECOM fica à esquerda alinhado pela base, sem rótulo.