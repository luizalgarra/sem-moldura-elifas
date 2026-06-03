import { Minus, Plus, Contrast, RotateCcw } from "lucide-react";
import { useAcessibilidade } from "@/hooks/useAcessibilidade";
import { Button } from "@/components/ui/button";

export function ControlesAcessibilidade() {
  const {
    escala,
    altoContraste,
    aumentarFonte,
    diminuirFonte,
    resetarFonte,
    alternarContraste,
  } = useAcessibilidade();

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label="Recursos de acessibilidade"
    >
      <Button
        variant="outline"
        size="icon"
        className="min-h-11 min-w-11"
        onClick={diminuirFonte}
        disabled={escala <= 0.9}
        aria-label="Diminuir tamanho do texto"
      >
        <Minus aria-hidden="true" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="min-h-11 min-w-11"
        onClick={resetarFonte}
        aria-label="Restaurar tamanho padrão do texto"
        title={`Tamanho do texto: ${Math.round(escala * 100)}%`}
      >
        <RotateCcw aria-hidden="true" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="min-h-11 min-w-11"
        onClick={aumentarFonte}
        disabled={escala >= 1.6}
        aria-label="Aumentar tamanho do texto"
      >
        <Plus aria-hidden="true" />
      </Button>
      <Button
        variant={altoContraste ? "default" : "outline"}
        size="icon"
        className="min-h-11 min-w-11"
        onClick={alternarContraste}
        aria-pressed={altoContraste}
        aria-label="Alternar modo de alto contraste"
      >
        <Contrast aria-hidden="true" />
      </Button>
    </div>
  );
}
