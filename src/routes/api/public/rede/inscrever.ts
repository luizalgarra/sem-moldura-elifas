// Recebe o formulario do site e devolve o id para abrir a conversa.
// Existe para que rede_lista_espera nunca precise aceitar escrita anonima direta.
import { createFileRoute } from "@tanstack/react-router";
import { CORS, db, dbPublico, ipDe, json, limpa } from "@/lib/rede-anfitriao.server";

async function inscrever(req: Request): Promise<Response> {
  let c: any;
  try { c = await req.json(); } catch { return json({ erro: "corpo invalido" }, 400); }

  const nome = limpa(c.nome, 120);
  const email = limpa(c.email, 160)?.toLowerCase() ?? null;
  if (!nome) return json({ erro: "diga como podemos te chamar" }, 400);
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return json({ erro: "e-mail invalido" }, 400);

  try {
    const rede = db();
    const { data: ok, error: eRate } = await rede.rpc("checar_rate_limit", { p_ip: ipDe(req), p_teto: 10 });
    if (eRate) console.error("ALERTA rate_limit indisponivel:", eRate.message ?? JSON.stringify(eRate));
    if (ok === false) return json({ erro: "muitas inscricoes deste endereco. tente mais tarde." }, 429);

    const pub = dbPublico();
    const linha = {
      nome, email,
      vinculo: limpa(c.vinculo, 600),
      perfil: limpa(c.perfil, 600),
      origem: limpa(c.origem, 60) ?? "site",
    };

    const { data, error } = await pub.from("rede_lista_espera").insert(linha).select("id").single();

    // Quem ja se inscreveu antes nao pode receber erro na cara. O indice unico
    // por lower(email) e proposital: a pessoa e a mesma, a conversa e nova.
    if (error) {
      if (error.code === "23505") {
        const { data: antiga, error: eBusca } = await pub
          .from("rede_lista_espera").select("id").ilike("email", email).limit(1).maybeSingle();
        if (eBusca) throw eBusca;
        if (antiga) return json({ lista_espera_id: (antiga as any).id, email, ja_inscrito: true });
      }
      throw error;
    }

    return json({ lista_espera_id: (data as any).id, email, ja_inscrito: false });
  } catch (e: any) {
    const msg = e?.message ?? JSON.stringify(e);
    console.error("rede-inscrever:", msg);
    return json({ erro: "nao consegui registrar sua inscricao agora. tente de novo em instantes." }, 500);
  }
}

export const Route = createFileRoute("/api/public/rede/inscrever")({
  server: {
    handlers: {
      OPTIONS: () => new Response("ok", { headers: CORS }),
      POST: ({ request }) => inscrever(request),
    },
  },
});
