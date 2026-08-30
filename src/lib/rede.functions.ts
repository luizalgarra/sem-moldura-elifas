import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const TABELA = "rede_lista_espera";

/**
 * As quatro respostas de "Quero um convite". O texto do rótulo é o que vai para
 * o banco: quem for ler a lista depois lê uma frase, não um código.
 */
export const PERFIS = [
  "Visitei a exposição da CAIXA",
  "Tenho interesse ou curiosidade sobre Elifas",
  "Participo de outras atividades do Instituto",
  "Sou estudante, pesquisador ou colecionador",
] as const;

const esquema = z.object({
  nome: z.string().trim().min(2, "Diga seu nome.").max(120),
  email: z.string().trim().toLowerCase().email("Confira o e-mail.").max(200),
  vinculo: z.string().trim().max(400).optional().default(""),
  // Validado contra a lista fechada: só entra no banco o que a página oferece.
  perfil: z.enum(PERFIS).optional(),
});

export type Inscricao = z.infer<typeof esquema>;

/**
 * Registra alguém na lista de espera da Rede Além da Moldura.
 *
 * Roda no servidor com a service_role porque a tabela não tem policy nenhuma:
 * ninguém lê nem escreve pelo cliente. A lista de convidados do IEA não é
 * material para ficar ao alcance da chave pública do site.
 *
 * O client.server entra por import dinâmico, como no resto do projeto, para o
 * módulo de servidor não ser arrastado para o bundle do navegador.
 */
export const inscreverNaListaDeEspera = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => esquema.parse(input))
  .handler(async ({ data }) => {
    try {
      return await gravar(data);
    } catch (erro) {
      // Qualquer falha daqui para dentro é de infraestrutura: chave de ambiente
      // ausente, banco fora do ar, tabela ainda não migrada. O visitante não
      // pode ver nada disso — a mensagem real fica no log do servidor.
      console.error("[rede] inscrição falhou:", erro);
      throw new Error("Não foi possível registrar agora. Tente de novo em instantes.");
    }
  });

async function gravar(data: Inscricao) {
  {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    /**
     * A tabela é nova e o `types.ts` do Supabase é gerado automaticamente — ele
     * só vai conhecer `rede_lista_espera` na próxima geração. Até lá este cast
     * segura o build sem editar um arquivo gerado, que seria sobrescrito.
     * Quando os tipos forem regerados, apague o cast.
     */
    const db = supabaseAdmin as unknown as {
      from: (t: string) => {
        insert: (v: unknown) => Promise<{
          error: { code?: string; message: string } | null;
        }>;
      };
    };

    const { error } = await db.from(TABELA).insert({
      nome: data.nome,
      email: data.email,
      vinculo: data.vinculo || null,
      perfil: data.perfil || null,
      origem: "site/rede-alem-da-moldura",
    });

    // 23505 = violação do índice único do e-mail. Quem já está na lista não
    // precisa ver um erro: para a pessoa, o resultado é o mesmo.
    if (error && error.code !== "23505") {
      throw new Error(error.message);
    }

    return { ok: true as const };
  }
}
