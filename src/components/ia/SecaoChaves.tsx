/**
 * Cartão de chaves dos provedores de IA.
 *
 * Mostra só o status (presente/ausente e se o provedor ainda aceita a chave).
 * O valor nunca aparece aqui: a troca acontece no formulário seguro da Lovable.
 */

import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Check, KeyRound, Loader2, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PROVEDORES, type Provedor } from "@/lib/ia-modelos";
import { verificarChave, type ChaveStatus } from "@/lib/ia-config.functions";

export function SecaoChaves({ chaves }: { chaves: Record<string, boolean> }) {
  const conferir = useServerFn(verificarChave);
  const [estado, setEstado] = useState<Record<string, ChaveStatus>>({});
  const [checando, setChecando] = useState<string | null>(null);
  const [trocar, setTrocar] = useState<{ nome: string; segredo: string } | null>(null);

  async function verificar(provedor: Provedor) {
    setChecando(provedor);
    try {
      const r = await conferir({ data: { provedor } });
      setEstado((e) => ({ ...e, [provedor]: r }));
    } catch (e) {
      setEstado((s) => ({
        ...s,
        [provedor]: { ok: false, erro: e instanceof Error ? e.message : "falhou" },
      }));
    } finally {
      setChecando(null);
    }
  }

  return (
    <section className="mt-8 rounded-lg border border-border p-5">
      <h2 className="font-serif text-xl font-semibold text-foreground">Chaves de acesso</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        As chaves ficam no cofre de segredos do projeto. Esta tela apenas confere se ainda
        funcionam — nenhum valor é exibido ou trafega pelo site.
      </p>

      <ul className="mt-4 space-y-2">
        {PROVEDORES.map((p) => {
          const tem = Boolean(chaves[p.id]);
          const st = estado[p.id];
          return (
            <li key={p.id} className="rounded-md border border-border/70 px-3 py-2.5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">{p.nome}</p>
                  <code className="text-sm text-muted-foreground">{p.segredo}</code>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm " +
                      (tem ? "bg-accent/15 text-foreground" : "bg-destructive/10 text-destructive")
                    }
                  >
                    {tem ? (
                      <KeyRound className="size-3.5" aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="size-3.5" aria-hidden="true" />
                    )}
                    {tem ? "chave presente" : "falta a chave"}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!tem || checando === p.id}
                    onClick={() => void verificar(p.id)}
                  >
                    {checando === p.id ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <ShieldCheck className="size-4" aria-hidden="true" />
                    )}
                    Verificar chave
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setTrocar({ nome: p.nome, segredo: p.segredo })}
                  >
                    Trocar chave
                  </Button>
                </div>
              </div>
              {st && (
                <p
                  className={
                    "mt-2 flex items-center gap-1.5 text-sm " +
                    (st.ok ? "text-muted-foreground" : "text-destructive")
                  }
                >
                  {st.ok ? (
                    <>
                      <Check className="size-4" aria-hidden="true" /> chave válida
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="size-4" aria-hidden="true" />
                      {st.status === 401 || st.status === 403
                        ? "chave recusada (inválida ou expirada)"
                        : (st.erro ?? "não foi possível verificar")}
                    </>
                  )}
                </p>
              )}
            </li>
          );
        })}
      </ul>

      <Dialog open={trocar !== null} onOpenChange={(a) => !a && setTrocar(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trocar a chave — {trocar?.nome}</DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-3 text-left">
                <p>
                  Por segurança, o valor da chave não pode ser digitado nesta página: ele é
                  guardado no cofre de segredos do projeto, fora do site.
                </p>
                <ol className="list-decimal space-y-1 pl-5">
                  <li>Gere ou copie a nova chave no painel do provedor.</li>
                  <li>
                    No chat da Lovable, peça: <em>“trocar o segredo {trocar?.segredo}”</em>.
                  </li>
                  <li>Cole o valor no formulário seguro que abrir e salve.</li>
                  <li>Volte aqui e use “Verificar chave” para confirmar.</li>
                </ol>
                <p className="text-sm">
                  Nome exato do segredo: <code>{trocar?.segredo}</code>
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  );
}
