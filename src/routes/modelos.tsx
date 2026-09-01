import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check, Loader2, KeyRound, AlertTriangle, Play } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROVEDORES, type Provedor } from "@/lib/ia-modelos";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { SecaoChaves } from "@/components/ia/SecaoChaves";
import { SecaoConsumo } from "@/components/ia/SecaoConsumo";
import {
  lerConfigIA,
  salvarConfigIA,
  testarModelo,
  type Teste,
} from "@/lib/ia-config.functions";

export const Route = createFileRoute("/modelos")({
  head: () => ({
    meta: [
      { title: "Modelos de IA — Instituto Elifas Andreato" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Painel administrativo para escolher qual modelo de inteligência artificial responde nas conversas da Rede Além da Moldura.",
      },
      { property: "og:title", content: "Modelos de IA — Instituto Elifas Andreato" },
      {
        property: "og:description",
        content: "Escolha do modelo que responde nas conversas da Rede Além da Moldura.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Modelos de IA — Instituto Elifas Andreato" },
      {
        name: "twitter:description",
        content: "Escolha do modelo que responde nas conversas da Rede Além da Moldura.",
      },
    ],
  }),
  component: Modelos,
});

function Modelos() {
  const ler = useServerFn(lerConfigIA);
  const salvar = useServerFn(salvarConfigIA);
  const testar = useServerFn(testarModelo);
  const { carregando, isAdmin } = useAdminAuth();

  const config = useQuery({
    queryKey: ["ia-config"],
    queryFn: () => ler({}),
    enabled: !carregando && isAdmin,
    retry: false,
  });

  const [salvando, setSalvando] = useState<string | null>(null);
  const [testando, setTestando] = useState<string | null>(null);
  const [testes, setTestes] = useState<Record<string, Teste>>({});
  const [aviso, setAviso] = useState<string | null>(null);
  const [livre, setLivre] = useState<Record<string, string>>({});

  const ativo = config.data;
  const chave = (provedor: Provedor, modelo: string) => `${provedor}:${modelo}`;

  async function usar(provedor: Provedor, modelo: string) {
    setAviso(null);
    setSalvando(chave(provedor, modelo));
    try {
      const r = await salvar({ data: { provedor, modelo } });
      if (!r.ok) setAviso(r.erro ?? "Não foi possível salvar.");
      else await config.refetch();
    } catch (e) {
      setAviso(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSalvando(null);
    }
  }

  async function experimentar(provedor: Provedor, modelo: string) {
    const k = chave(provedor, modelo);
    setTestando(k);
    try {
      const r = await testar({ data: { provedor, modelo } });
      setTestes((t) => ({ ...t, [k]: r }));
    } catch (e) {
      setTestes((t) => ({
        ...t,
        [k]: { ok: false, ms: 0, erro: e instanceof Error ? e.message : "falhou" },
      }));
    } finally {
      setTestando(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground">Modelos de IA</h1>
      <p className="mt-2 text-muted-foreground">
        Escolha qual modelo responde nas conversas da Rede Além da Moldura. A troca vale para
        todas as conversas assim que você salva.
      </p>

      {config.isLoading && (
        <p className="mt-8 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Carregando…
        </p>
      )}

      {config.error && (
        <p role="alert" className="mt-8 text-destructive">
          {config.error instanceof Error ? config.error.message : "Falha ao carregar."}
        </p>
      )}

      {aviso && (
        <p role="alert" className="mt-6 text-destructive">
          {aviso}
        </p>
      )}

      {ativo && (
        <p className="mt-6 rounded-md border border-border bg-secondary/40 px-4 py-3 text-foreground">
          Em uso agora: <strong>{ativo.provedor}</strong> — <code>{ativo.modelo}</code>
        </p>
      )}

      {ativo &&
        PROVEDORES.map((p) => {
          const temChave = ativo.chaves[p.id];
          return (
            <section key={p.id} className="mt-8 rounded-lg border border-border p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif text-xl font-semibold text-foreground">{p.nome}</h2>
                <span
                  className={
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm " +
                    (temChave
                      ? "bg-accent/15 text-foreground"
                      : "bg-destructive/10 text-destructive")
                  }
                >
                  {temChave ? (
                    <KeyRound className="size-3.5" aria-hidden="true" />
                  ) : (
                    <AlertTriangle className="size-3.5" aria-hidden="true" />
                  )}
                  {temChave ? "chave presente" : "falta a chave"}
                </span>
              </div>

              <ul className="mt-4 space-y-2">
                {p.modelos.map((m) => {
                  const k = chave(p.id, m.id);
                  const emUso = ativo.provedor === p.id && ativo.modelo === m.id;
                  const teste = testes[k];
                  return (
                    <li
                      key={m.id}
                      className="rounded-md border border-border/70 px-3 py-2.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{m.rotulo}</p>
                          <code className="text-sm text-muted-foreground">{m.id}</code>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={!temChave || testando === k}
                            onClick={() => void experimentar(p.id, m.id)}
                          >
                            {testando === k ? (
                              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                            ) : (
                              <Play className="size-4" aria-hidden="true" />
                            )}
                            Testar
                          </Button>
                          <Button
                            size="sm"
                            disabled={!temChave || emUso || salvando === k}
                            onClick={() => void usar(p.id, m.id)}
                          >
                            {salvando === k && (
                              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                            )}
                            {emUso && <Check className="size-4" aria-hidden="true" />}
                            {emUso ? "Em uso" : "Usar este modelo"}
                          </Button>
                        </div>
                      </div>
                      {teste && (
                        <p
                          className={
                            "mt-2 text-sm " + (teste.ok ? "text-muted-foreground" : "text-destructive")
                          }
                        >
                          {teste.ok
                            ? `respondeu em ${teste.ms} ms: ${teste.resposta || "(sem texto)"}`
                            : `falhou em ${teste.ms} ms: ${teste.erro}`}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div className="mt-4 flex flex-wrap items-end gap-2">
                <div className="grow">
                  <label
                    htmlFor={`livre-${p.id}`}
                    className="text-sm font-medium text-foreground"
                  >
                    Outro modelo deste provedor
                  </label>
                  <Input
                    id={`livre-${p.id}`}
                    value={livre[p.id] ?? ""}
                    placeholder="nome exato do modelo"
                    onChange={(e) => setLivre((l) => ({ ...l, [p.id]: e.target.value }))}
                    className="mt-1"
                  />
                </div>
                <Button
                  variant="outline"
                  disabled={!temChave || !(livre[p.id] ?? "").trim()}
                  onClick={() => void experimentar(p.id, (livre[p.id] ?? "").trim())}
                >
                  Testar
                </Button>
                <Button
                  disabled={!temChave || !(livre[p.id] ?? "").trim()}
                  onClick={() => void usar(p.id, (livre[p.id] ?? "").trim())}
                >
                  Usar
                </Button>
              </div>

              {(() => {
                const id = (livre[p.id] ?? "").trim();
                const t = id ? testes[chave(p.id, id)] : undefined;
                if (!t) return null;
                return (
                  <p
                    className={"mt-2 text-sm " + (t.ok ? "text-muted-foreground" : "text-destructive")}
                  >
                    {t.ok
                      ? `respondeu em ${t.ms} ms: ${t.resposta || "(sem texto)"}`
                      : `falhou em ${t.ms} ms: ${t.erro}`}
                  </p>
                );
              })()}
            </section>
          );
        })}
    </div>
  );
}
