## Objetivo

Corrigir o download do MP3 no iOS Safari, que hoje navega o documento para fora e zera o estado do componente (sintoma "gerou a locução mas voltou ao estado anterior"). A correção troca o download por link direto por um download em memória (blob) + compartilhamento nativo, com fallback para desktop.

## Mudança (arquivo: `src/routes/admin.tsx`)

### 1. Novo estado
Adicionar junto aos demais `useState` do componente da obra:
```ts
const [baixando, setBaixando] = useState(false);
```

### 2. Reescrever `handleBaixar` (linhas 361–375)
```ts
const handleBaixar = async () => {
  if (!downloadSrc || baixando) return;
  setMsg(null);
  setBaixando(true);
  try {
    // iOS Safari ignora o atributo `download` em URLs de servidor e navega
    // para fora (zerando o estado). Baixar como blob evita qualquer navegação.
    const resp = await fetch(downloadSrc);
    if (!resp.ok) throw new Error("falha no download");
    const blob = await resp.blob();
    const nome = `obra-${num}.mp3`;

    // iOS/mobile: compartilhamento nativo (inclui "Salvar em Arquivos").
    const file = new File([blob], nome, { type: "audio/mpeg" });
    const nav = navigator as Navigator & {
      canShare?: (data?: ShareData) => boolean;
    };
    if (nav.canShare && nav.canShare({ files: [file] })) {
      try {
        await nav.share({ files: [file], title: nome });
        return;
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return; // usuário cancelou
        // share indisponível: segue para o fallback por link
      }
    }

    // Fallback (desktop/navegadores sem Web Share): link com object URL.
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nome;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch {
    setMsg("Não foi possível baixar o áudio.");
  } finally {
    setBaixando(false);
  }
};
```

### 3. Botão de download (≈ linha 476–479)
Refletir o estado assíncrono: `disabled={baixando}` e label "Baixando…" enquanto `baixando` for `true`.

## Validação
- Build/typecheck (automático).
- Verificar no preview que o botão de download funciona no desktop (fallback por link).
- Confirmar com o usuário no iPhone que: baixar o MP3 abre o menu nativo de compartilhamento/"Salvar em Arquivos" e **não** reseta a tela.

## Observações
- Não altera a lógica de geração/persistência (`handleRegenerar`, server functions) — essas já foram corrigidas antes. Esta mudança ataca a causa mobile remanescente: a navegação disparada pelo clique de download.
