import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";

import {
  chamarRede,
  redeConfigurada,
  PERFIS,
  type Perfil,
  type RespostaConversa,
  type RespostaInscrever,
} from "@/lib/rede-backend";
import { Conversa, guardarSessao, type Turno } from "@/components/rede/Conversa";


/**
 * Página de lançamento da Rede Além da Moldura.
 *
 * NÃO ENTRA NA NAVEGAÇÃO. Fica fora de src/data/navegacao.ts de propósito: o
 * acesso é por link direto, mandado a convidados. O `robots: noindex` mantém a
 * página fora das buscas — sem isso, "Rede Além da Moldura" no Google abriria
 * um convite que era para ser fechado.
 */
const TITULO = "Rede Além da Moldura — Instituto Elifas Andreato";
const RESUMO =
  "Conversas livres sobre arte, cultura, música e liberdade na vida de Elifas Andreato. Lançamento por convite, com lista de espera aberta.";

export const Route = createFileRoute("/rede-alem-da-moldura")({
  head: () => ({
    meta: [
      { title: TITULO },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: RESUMO },

      /*
       * Sem estes, a página herda o preview da exposição do __root e o link
       * compartilhado no WhatsApp anuncia "Catálogo virtual da exposição" —
       * outra coisa. Como esta página existe justamente para circular por link
       * entre convidados, o cartão de preview é a primeira coisa que a pessoa lê.
       * O `noindex` não resolve isso: ele fala com buscadores, não com
       * WhatsApp, Telegram ou Slack.
       */
      { property: "og:title", content: TITULO },
      { property: "og:description", content: RESUMO },
      { name: "twitter:title", content: TITULO },
      { name: "twitter:description", content: RESUMO },
    ],
  }),
  component: Rede,
});

type EstadoConversa = {
  conversaId: string;
  sessao: string;
  turnos: Turno[];
  faltam: number;
  ferramentas: string[];
};

function Rede() {
  const [conversa, setConversa] = useState<EstadoConversa | null>(null);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">

      <p className="font-semibold tracking-[0.18em] text-accent uppercase">
        Venha conversar sobre Elifas Andreato
      </p>
      <h1 className="mt-3 font-serif text-3xl leading-tight font-bold text-foreground sm:text-5xl">
        Rede Além da Moldura
      </h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Conversas livres sobre arte, cultura, música, liberdade, na vida de Elifas e sua influência
        para o Brasil.
      </p>

      <hr className="my-10 h-0.5 w-12 border-0 bg-accent" />

      <div className="space-y-5 text-muted-foreground">
        <p>
          Ampliando a exposição que celebra os 80 anos de Elifas, o IEA lança um selo de
          certificação e abre uma rede independente de conversações sobre suas obras, a{" "}
          <strong className="font-semibold text-foreground">Rede Além da Moldura</strong>.
        </p>
        <p>
          A Rede Além da Moldura traz interações entre os participantes segundo o{" "}
          <strong className="font-semibold text-foreground">Protocolo Girassol</strong>, um esforço
          comunitário experimental para a produção, validação e remuneração da inteligência humana
          situada.
        </p>
        <p>
          Elifas nunca produziu para deixar na gaveta, sempre criou arte popular de grande alcance,
          provocante: capas de discos, cartazes e ilustrações que mexiam com a cabeça dos
          brasileiros sob a ditadura militar e faziam pensar sobre qual Brasil queremos para nós.
        </p>
        <p>
          Seu trabalho sempre foi arte viva, vibrante e oportuna, gerando conversas e reflexões com
          grande poder de transformação de seu tempo.
        </p>
        <p>
          A Rede Além da Moldura resgata este espaço de conversa, preservando e gerando valor para a
          comunidade do IEA. Para isso neste lançamento estará aberta apenas por convite para
          pessoas que já participaram de alguma aula, atividade, exposição ou evento do IEA, sendo
          que os convidados também poderão convidar outras pessoas.
        </p>
        <p>
          De qualquer modo estamos abrindo uma lista de espera e aguardamos sua inscrição para
          conhecer e conversar na Rede Além da Moldura.
        </p>
        <p className="text-foreground">Recebam nossas boas vindas.</p>
      </div>

      {conversa ? (
        <Conversa
          conversaId={conversa.conversaId}
          sessao={conversa.sessao}
          turnosIniciais={conversa.turnos}
          faltamIniciais={conversa.faltam}
          ferramentasIniciais={conversa.ferramentas}
        />
      ) : (
        <Formulario aoAbrir={setConversa} />
      )}
    </div>
  );
}

const CAMPO =
  "mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-foreground " +
  "placeholder:text-muted-foreground/60 focus-visible:border-accent focus-visible:outline-none";

function Formulario({ aoAbrir }: { aoAbrir: (estado: EstadoConversa) => void }) {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  /**
   * Uma inscrição, um registro. Quem grava é a `rede-inscrever`: ela valida,
   * limita por IP e, se a pessoa já estiver na lista (índice único por
   * lower(email)), devolve o id existente com `ja_inscrito`. Voltar não é erro.
   * Em seguida abrimos a conversa com esse mesmo id.
   */
  async function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setEnviando(true);
    setErro(null);
    try {
      const inscricao = await chamarRede<RespostaInscrever>("rede-inscrever", {
        nome: String(form.get("nome") ?? "").trim(),
        email: String(form.get("email") ?? "").trim(),
        vinculo: String(form.get("vinculo") ?? "").trim(),
        perfil: (form.get("perfil") as Perfil | null) ?? undefined,
        origem: "site/rede-alem-da-moldura",
      });

      const aberta = await chamarRede<RespostaConversa>("rede-conversa", {
        action: "abrir",
        lista_espera_id: inscricao.lista_espera_id,
        email: inscricao.email,
        base_url: window.location.origin,
      });

      guardarSessao(aberta.conversa_id, aberta.sessao);
      aoAbrir({
        conversaId: aberta.conversa_id,
        sessao: aberta.sessao,
        turnos: [{ de: "anfitriao", texto: aberta.mensagem }],
        faltam: aberta.faltam?.length ?? 1,
        ferramentas: aberta.ferramentas ?? [],
      });
    } catch (err) {
      setEnviando(false);
      setErro(err instanceof Error ? err.message : "Não foi possível começar agora.");
    }
  }

  return (
    <section className="mt-12 rounded-lg border border-border bg-secondary/40 p-6">
      <h2 className="font-serif text-2xl font-semibold text-foreground">
        Entrar na Rede
      </h2>
      <p className="mt-2 text-muted-foreground">
        São duas perguntas e, logo depois, uma conversa curta com o Anfitrião — aqui mesmo
        nesta página, do seu jeito e no seu tempo.
      </p>





      <form onSubmit={enviar} className="mt-6 space-y-4">
        <div>
          <label htmlFor="nome" className="font-medium text-foreground">
            Nome <span aria-hidden="true">*</span>
          </label>
          <input
            id="nome"
            name="nome"
            required
            minLength={2}
            maxLength={120}
            autoComplete="name"
            className={CAMPO}
          />
        </div>

        <div>
          <label htmlFor="email" className="font-medium text-foreground">
            E-mail <span aria-hidden="true">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            inputMode="email"
            className={CAMPO}
          />
        </div>

        <div>
          <label htmlFor="vinculo" className="font-medium text-foreground">
            Que atividade do IEA você já frequentou?
          </label>
          <p id="vinculo-ajuda" className="mt-1 text-sm text-muted-foreground">
            Uma aula, uma exposição, um evento — o que você lembrar. Ajuda o Instituto a reconhecer
            você.
          </p>
          <textarea
            id="vinculo"
            name="vinculo"
            rows={3}
            maxLength={400}
            aria-describedby="vinculo-ajuda"
            className={CAMPO}
          />
        </div>

        {/*
          fieldset + legend é a marcação correta para um grupo de opções: o
          leitor de tela anuncia "Quero um convite" antes de cada alternativa,
          em vez de ler quatro frases soltas sem saber a que pergunta respondem.
        */}
        <fieldset>
          <legend className="font-medium text-foreground">Quero um convite</legend>
          <div className="mt-2 space-y-1">
            {PERFIS.map((opcao) => (
              <label
                key={opcao}
                className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-md px-2 text-muted-foreground transition-colors hover:bg-accent/10 hover:text-foreground"
              >
                <input
                  type="radio"
                  name="perfil"
                  value={opcao}
                  className="size-4 shrink-0 accent-[var(--accent)]"
                />
                <span>{opcao}</span>
              </label>
            ))}
          </div>
        </fieldset>

        {erro && (
          <p role="alert" className="text-sm text-destructive">
            {erro}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md bg-primary px-6 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {enviando && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {enviando ? "Abrindo…" : "Começar a conversa"}
        </button>


        <p className="text-sm text-muted-foreground">
          Seus dados ficam apenas com o Instituto Elifas Andreato e servem só para o convite à Rede.
        </p>
      </form>
    </section>
  );
}
