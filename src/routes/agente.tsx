import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Check, Loader2, MessageCircle, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { PROVEDORES } from "@/lib/ia-modelos";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import {
  lerAgenteConfig,
  salvarAgenteConfig,
  testarAgente,
  type Teste,
} from "@/lib/ia-config.functions";

export const Route = createFileRoute("/agente")({
  head: () => ({
    meta: [
      { title: "Configurar o Anfitrião — Instituto Elifas Andreato" },
      { name: "robots", content: "noindex, nofollow" },
      {
        name: "description",
        content:
          "Painel administrativo para ajustar personalidade, tom, regras e modelos do agente de IA da Rede Além da Moldura.",
      },
      { property: "og:title", content: "Configurar o Anfitrião — Instituto Elifas Andreato" },
      {
        property: "og:description",
        content: "Personalidade, tom, regras e modelos do Anfitrião da Rede Além da Moldura.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:title", content: "Configurar o Anfitrião — Instituto Elifas Andreato" },
      {
        name: "twitter:description",
        content: "Personalidade, tom, regras e modelos do Anfitrião da Rede Além da Moldura.",
      },
    ],
  }),
  component: Agente,
});

const GLOBAL = "__global__";

/** Opções "provedor:modelo" de todo o catálogo. */
const OPCOES_MODELOS = PROVEDORES.flatMap((p) =>
  p.modelos.map((m) => ({ valor: `${p.id}:${m.id}`, rotulo: `${p.nome} — ${m.rotulo}` })),
);

function SeletorModelo({
  id,
  rotulo,
  ajuda,
  valor,
  onChange,
}: {
  id: string;
  rotulo: string;
  ajuda: string;
  valor: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <Label htmlFor={id}>{rotulo}</Label>
      <Select
        value={valor || GLOBAL}
        onValueChange={(v) => onChange(v === GLOBAL ? "" : v)}
      >
        <SelectTrigger id={id} className="mt-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={GLOBAL}>Modelo global (o da página /modelos)</SelectItem>
          {OPCOES_MODELOS.map((o) => (
            <SelectItem key={o.valor} value={o.valor}>
              {o.rotulo}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="mt-1 text-sm text-muted-foreground">{ajuda}</p>
    </div>
  );
}

function Agente() {
  const ler = useServerFn(lerAgenteConfig);
  const salvar = useServerFn(salvarAgenteConfig);
  const testar = useServerFn(testarAgente);
  const { carregando, isAdmin } = useAdminAuth();

  const config = useQuery({
    queryKey: ["agente-config"],
    queryFn: () => ler({}),
    enabled: !carregando && isAdmin,
    retry: false,
  });

  const [instrucoes, setInstrucoes] = useState("");
  const [regras, setRegras] = useState("");
  const [temperatura, setTemperatura] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(1024);
  const [modeloA, setModeloA] = useState("");
  const [modeloB, setModeloB] = useState("");
  const [fallback, setFallback] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  const [pergunta, setPergunta] = useState("");
  const [testando, setTestando] = useState(false);
  const [teste, setTeste] = useState<Teste | null>(null);

  useEffect(() => {
    const c = config.data;
    if (!c) return;
    setInstrucoes(c.instrucoes);
    setRegras(c.regras_extras);
    setTemperatura(c.temperatura);
    setMaxTokens(c.max_tokens);
    setModeloA(c.modelo_etapa_a);
    setModeloB(c.modelo_etapa_b);
    setFallback(c.modelo_fallback);
  }, [config.data]);

  async function gravar() {
    setAviso(null);
    setSalvo(false);
    setSalvando(true);
    try {
      const r = await salvar({
        data: {
          instrucoes,
          regras_extras: regras,
          temperatura,
          max_tokens: maxTokens,
          modelo_etapa_a: modeloA,
          modelo_etapa_b: modeloB,
          modelo_fallback: fallback,
        },
      });
      if (!r.ok) setAviso(r.erro ?? "Não foi possível salvar.");
      else {
        setSalvo(true);
        await config.refetch();
      }
    } catch (e) {
      setAviso(e instanceof Error ? e.message : "Não foi possível salvar.");
    } finally {
      setSalvando(false);
    }
  }

  async function experimentar() {
    setTestando(true);
    setTeste(null);
    try {
      const r = await testar({ data: { mensagem: pergunta.trim() } });
      setTeste(r);
    } catch (e) {
      setTeste({ ok: false, ms: 0, erro: e instanceof Error ? e.message : "falhou" });
    } finally {
      setTestando(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground">Configurar o Anfitrião</h1>
      <p className="mt-2 text-muted-foreground">
        Aqui você ajusta como o Anfitrião fala e qual modelo responde em cada etapa da
        conversa. O que você salvar vale já na próxima mensagem. Para trocar chaves e ver
        consumo, use a página{" "}
        <Link to="/modelos" className="underline underline-offset-2">
          /modelos
        </Link>
        .
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

      {config.data && (
        <>
          <section className="mt-8 rounded-lg border border-border p-5">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Personalidade e tom
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Instruções livres que entram no topo da conversa. Ex.: “fale como quem recebe
              alguém na sala de casa; chame a pessoa pelo primeiro nome”.
            </p>
            <Textarea
              value={instrucoes}
              onChange={(e) => setInstrucoes(e.target.value)}
              rows={5}
              className="mt-3"
              placeholder="Como o Anfitrião deve soar…"
              aria-label="Instruções de personalidade e tom"
            />

            <Label htmlFor="regras" className="mt-5 block">
              Regras extras
            </Label>
            <p className="mt-1 text-sm text-muted-foreground">
              Proibições e obrigações além das regras fixas. Ex.: “nunca fale de política”,
              “sempre ofereça o link de retomada quando a pessoa disser que precisa sair”.
            </p>
            <Textarea
              id="regras"
              value={regras}
              onChange={(e) => setRegras(e.target.value)}
              rows={4}
              className="mt-2"
              placeholder="Regras extras, uma por linha…"
            />
          </section>

          <section className="mt-6 rounded-lg border border-border p-5">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Parâmetros da resposta
            </h2>

            <div className="mt-4">
              <div className="flex items-baseline justify-between">
                <Label htmlFor="temperatura">Temperatura</Label>
                <span className="text-sm text-muted-foreground">{temperatura.toFixed(2)}</span>
              </div>
              <Slider
                id="temperatura"
                min={0}
                max={1}
                step={0.05}
                value={[temperatura]}
                onValueChange={([v]) => setTemperatura(v ?? 0.7)}
                className="mt-2"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                Mais baixo = respostas previsíveis e fiéis; mais alto = mais criativas.
              </p>
            </div>

            <div className="mt-5 max-w-xs">
              <Label htmlFor="max-tokens">Tamanho máximo da resposta (tokens)</Label>
              <Input
                id="max-tokens"
                type="number"
                min={64}
                max={8192}
                step={64}
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value) || 1024)}
                className="mt-1"
              />
              <p className="mt-1 text-sm text-muted-foreground">
                1024 tokens dão cerca de 3 a 4 parágrafos curtos.
              </p>
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-border p-5">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Modelo por etapa
            </h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">
              <SeletorModelo
                id="modelo-a"
                rotulo="Etapa A — acolhimento e cadastro"
                ajuda="Primeira conversa, logo depois do formulário."
                valor={modeloA}
                onChange={setModeloA}
              />
              <SeletorModelo
                id="modelo-b"
                rotulo="Etapa B — retomada e ficha"
                ajuda="Segunda conversa, pelo link de retomada."
                valor={modeloB}
                onChange={setModeloB}
              />
              <SeletorModelo
                id="modelo-fallback"
                rotulo="Reserva (fallback)"
                ajuda="Se o modelo da etapa falhar, o Anfitrião tenta este antes de desistir."
                valor={fallback}
                onChange={setFallback}
              />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Deixar em “modelo global” usa a escolha da página /modelos.
            </p>
          </section>

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={() => void gravar()} disabled={salvando}>
              {salvando ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : salvo ? (
                <Check className="size-4" aria-hidden="true" />
              ) : (
                <Save className="size-4" aria-hidden="true" />
              )}
              {salvo ? "Salvo" : "Salvar configuração"}
            </Button>
            {config.data.atualizado_em && (
              <span className="text-sm text-muted-foreground">
                Última alteração: {new Date(config.data.atualizado_em).toLocaleString("pt-BR")}
              </span>
            )}
          </div>

          <section className="mt-8 rounded-lg border border-border p-5">
            <h2 className="font-serif text-xl font-semibold text-foreground">
              Testar o tom
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Manda uma mensagem ao Anfitrião com a configuração já salva — sem gravar nada
              no banco. Salve antes de testar.
            </p>
            <div className="mt-3 flex flex-wrap items-end gap-2">
              <div className="grow">
                <Label htmlFor="pergunta">Mensagem de teste</Label>
                <Input
                  id="pergunta"
                  value={pergunta}
                  onChange={(e) => setPergunta(e.target.value)}
                  placeholder="Ex.: oi, eu conheci o Elifas num show em 78"
                  className="mt-1"
                />
              </div>
              <Button
                variant="outline"
                disabled={!pergunta.trim() || testando}
                onClick={() => void experimentar()}
              >
                {testando ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <MessageCircle className="size-4" aria-hidden="true" />
                )}
                Testar
              </Button>
            </div>
            {teste && (
              <p
                className={
                  "mt-3 rounded-md border px-3 py-2 text-sm " +
                  (teste.ok
                    ? "border-border bg-secondary/40 text-foreground"
                    : "border-destructive/40 text-destructive")
                }
              >
                {teste.ok
                  ? `respondeu em ${teste.ms} ms: ${teste.resposta || "(sem texto)"}`
                  : `falhou em ${teste.ms} ms: ${teste.erro}`}
              </p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
