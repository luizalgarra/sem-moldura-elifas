import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Privacidade e Segurança — Elifas Andreato: Além da Moldura" },
      {
        name: "description",
        content:
          "Como o catálogo virtual da exposição \u201cElifas Andreato — Além da Moldura\u201d trata dados, privacidade e segurança.",
      },
      {
        property: "og:title",
        content: "Privacidade e Segurança — Elifas Andreato",
      },
      {
        property: "og:description",
        content:
          "Informações sobre privacidade, dados e segurança do catálogo virtual da exposição.",
      },
    ],
  }),
  component: Privacidade,
});

function Secao({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="font-serif text-xl font-bold text-foreground sm:text-2xl">
        {titulo}
      </h2>
      <div className="mt-3 space-y-3 leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function Privacidade() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
        Privacidade e Segurança
      </h1>

      <p className="mt-4 text-sm text-muted-foreground">
        Esta página é mantida pelo Instituto Elifas Andreato para responder a
        dúvidas comuns sobre privacidade e segurança do catálogo virtual da
        exposição “Elifas Andreato — Além da Moldura”. É um conteúdo editável do
        próprio projeto e não constitui certificação ou verificação
        independente.
      </p>

      <Secao titulo="Dados que coletamos">
        <p>
          O catálogo é de acesso público e livre. A navegação pelas obras, pela
          linha do tempo e pelos QR Codes não exige cadastro nem login. Em
          formulários opcionais — como o de contato e o boletim — coletamos
          apenas as informações que você nos fornece voluntariamente (por
          exemplo, nome e e-mail) para responder à sua solicitação.
        </p>
      </Secao>

      <Secao titulo="Como usamos as informações">
        <p>
          As informações enviadas em formulários são usadas exclusivamente para
          a finalidade indicada no momento do envio (responder a um contato ou
          enviar o boletim). Não vendemos nem comercializamos dados pessoais.
        </p>
      </Secao>

      <Secao titulo="Acesso administrativo e segurança">
        <p>
          A área administrativa do catálogo é restrita e protegida por
          autenticação. O acesso a arquivos internos de mídia (imagens e áudios)
          é controlado e limitado a administradores autorizados. Imagens e
          áudios públicos das obras são disponibilizados de forma segura por
          meio do nosso servidor.
        </p>
        <p>
          A comunicação com o site é criptografada em trânsito (HTTPS) e o
          acesso aos dados é protegido por regras de controle de acesso no banco
          de dados.
        </p>
      </Secao>

      <Secao titulo="Cookies e medição de audiência">
        <p>
          Podemos utilizar recursos mínimos de armazenamento no navegador para
          lembrar suas preferências de acessibilidade (como contraste e tamanho
          de fonte). Caso utilizemos ferramentas de medição de audiência, elas
          servem apenas para entender o uso geral do catálogo, de forma agregada.
        </p>
      </Secao>

      <Secao titulo="Acessibilidade">
        <p>
          Todas as obras contam com áudio-descrição, e o catálogo oferece
          controles de acessibilidade para tornar a experiência mais inclusiva.
        </p>
      </Secao>

      <Secao titulo="Seus direitos e contato">
        <p>
          Para solicitar acesso, correção ou exclusão de dados pessoais que você
          tenha nos enviado, ou para relatar uma preocupação de segurança, entre
          em contato pela{" "}
          <a href="/participe/contato" className="text-accent hover:underline">
            página de contato
          </a>
          .
        </p>
      </Secao>
    </div>
  );
}
