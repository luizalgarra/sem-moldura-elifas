## Objetivo
Duplicar a caixa de destaque "Linha do Tempo" (atualmente em `/obras`) e exibi-la na página inicial, logo acima da seção "Algumas obras".

## Mudanças
Arquivo único: `src/routes/index.tsx`

1. **Imports**: adicionar `Route as RouteIcon` de `lucide-react` (o `ArrowRight` e `Link` já existem).
2. **Inserir a caixa** entre o fim da `<section>` do hero (linha 90) e o início do bloco `{destaques.length > 0 && (...)}`:

```tsx
<section className="mx-auto max-w-5xl px-4 pt-10">
  <Link
    to="/linhas-da-vida"
    className="group flex items-center gap-4 rounded-lg border border-accent bg-card p-5 transition-colors hover:bg-accent/10"
  >
    <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
      <RouteIcon className="size-6" aria-hidden="true" />
    </span>
    <span className="flex-1">
      <span className="block font-serif text-lg font-semibold text-accent">
        Linha do Tempo
      </span>
      <span className="block text-sm text-muted-foreground">
        Percorra a trajetória de Elifas Andreato e as histórias por trás das obras.
      </span>
    </span>
    <ArrowRight
      className="size-5 shrink-0 text-accent transition-transform group-hover:translate-x-1"
      aria-hidden="true"
    />
  </Link>
</section>
```

A caixa é idêntica à de `/obras`, apenas envolvida numa `<section>` própria com espaçamento adequado à home. Nenhuma lógica de backend é alterada.