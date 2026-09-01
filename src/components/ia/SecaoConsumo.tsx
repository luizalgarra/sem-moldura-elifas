/**
 * Consumo de IA por modelo: chamadas, tokens e custo estimado.
 *
 * O custo é uma estimativa feita com a tabela de preços do projeto; o valor
 * oficial é sempre o do painel de cobrança de cada provedor.
 */

import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { resumoUsoIA, type Periodo } from "@/lib/ia-config.functions";
import { custoEstimado, formatarUSD } from "@/lib/ia-precos";

const PERIODOS: { id: Periodo; rotulo: string }[] = [
  { id: "hoje", rotulo: "Hoje" },
  { id: "7d", rotulo: "7 dias" },
  { id: "30d", rotulo: "30 dias" },
  { id: "tudo", rotulo: "Tudo" },
];

const num = (n: number) => n.toLocaleString("pt-BR");

export function SecaoConsumo({ pronto }: { pronto: boolean }) {
  const buscar = useServerFn(resumoUsoIA);
  const [periodo, setPeriodo] = useState<Periodo>("30d");

  const uso = useQuery({
    queryKey: ["ia-uso", periodo],
    queryFn: () => buscar({ data: { periodo } }),
    enabled: pronto,
    retry: false,
  });

  const linhas = uso.data?.linhas ?? [];
  const dias = uso.data?.dias ?? [];
  const maiorDia = Math.max(1, ...dias.map((d) => d.tokens));

  let totalTokens = 0;
  let totalCusto = 0;
  let algumSemPreco = false;
  for (const l of linhas) {
    totalTokens += l.tokens_entrada + l.tokens_saida;
    const c = custoEstimado(l.modelo, l.tokens_entrada, l.tokens_saida);
    if (c === null) algumSemPreco = true;
    else totalCusto += c;
  }

  return (
    <section className="mt-8 rounded-lg border border-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-serif text-xl font-semibold text-foreground">Consumo por modelo</h2>
        <div className="flex gap-1">
          {PERIODOS.map((p) => (
            <Button
              key={p.id}
              size="sm"
              variant={periodo === p.id ? "default" : "outline"}
              onClick={() => setPeriodo(p.id)}
            >
              {p.rotulo}
            </Button>
          ))}
        </div>
      </div>

      <p className="mt-1 text-sm text-muted-foreground">
        Custo estimado com a tabela de preços do projeto. O valor oficial é o do painel de cada
        provedor.
      </p>

      {uso.isLoading && (
        <p className="mt-4 flex items-center gap-2 text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" /> Carregando…
        </p>
      )}

      {uso.error && (
        <p role="alert" className="mt-4 text-destructive">
          {uso.error instanceof Error ? uso.error.message : "Falha ao carregar o consumo."}
        </p>
      )}

      {uso.data && linhas.length === 0 && (
        <p className="mt-4 text-muted-foreground">Nenhuma chamada registrada neste período.</p>
      )}

      {linhas.length > 0 && (
        <>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-3 font-medium">Modelo</th>
                  <th className="py-2 pr-3 text-right font-medium">Chamadas</th>
                  <th className="py-2 pr-3 text-right font-medium">Erros</th>
                  <th className="py-2 pr-3 text-right font-medium">Tokens entrada</th>
                  <th className="py-2 pr-3 text-right font-medium">Tokens saída</th>
                  <th className="py-2 text-right font-medium">Custo estimado</th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => {
                  const c = custoEstimado(l.modelo, l.tokens_entrada, l.tokens_saida);
                  return (
                    <tr key={`${l.provedor}:${l.modelo}`} className="border-b border-border/60">
                      <td className="py-2 pr-3">
                        <span className="text-muted-foreground">{l.provedor}</span>{" "}
                        <code className="text-foreground">{l.modelo}</code>
                      </td>
                      <td className="py-2 pr-3 text-right">{num(l.chamadas)}</td>
                      <td
                        className={
                          "py-2 pr-3 text-right " + (l.erros > 0 ? "text-destructive" : "")
                        }
                      >
                        {num(l.erros)}
                      </td>
                      <td className="py-2 pr-3 text-right">{num(l.tokens_entrada)}</td>
                      <td className="py-2 pr-3 text-right">{num(l.tokens_saida)}</td>
                      <td className="py-2 text-right">{c === null ? "—" : formatarUSD(c)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="font-medium text-foreground">
                  <td className="py-2 pr-3">Total</td>
                  <td className="py-2 pr-3 text-right">
                    {num(linhas.reduce((s, l) => s + l.chamadas, 0))}
                  </td>
                  <td className="py-2 pr-3 text-right">
                    {num(linhas.reduce((s, l) => s + l.erros, 0))}
                  </td>
                  <td className="py-2 pr-3 text-right" colSpan={2}>
                    {num(totalTokens)} tokens
                  </td>
                  <td className="py-2 text-right">
                    {formatarUSD(totalCusto)}
                    {algumSemPreco ? "*" : ""}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {algumSemPreco && (
            <p className="mt-2 text-xs text-muted-foreground">
              * Sem alguns modelos: não há preço cadastrado para eles.
            </p>
          )}

          <h3 className="mt-6 font-medium text-foreground">Tokens por dia</h3>
          <ul className="mt-2 space-y-1">
            {dias.map((d) => (
              <li key={d.dia} className="flex items-center gap-3 text-sm">
                <span className="w-24 shrink-0 text-muted-foreground">
                  {d.dia.slice(8, 10)}/{d.dia.slice(5, 7)}
                </span>
                <span className="h-2 grow rounded-full bg-secondary">
                  <span
                    className="block h-2 rounded-full bg-accent"
                    style={{ width: `${Math.round((d.tokens / maiorDia) * 100)}%` }}
                  />
                </span>
                <span className="w-32 shrink-0 text-right text-muted-foreground">
                  {num(d.tokens)} tokens
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
