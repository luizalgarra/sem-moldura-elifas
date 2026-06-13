import { useEffect, useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { marca } from "@/assets/marca";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acesso restrito — Elifas Andreato" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthPagina,
});

const credenciaisSchema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres").max(72),
});

function AuthPagina() {
  const router = useRouter();
  const { session, isAdmin, carregando } = useAdminAuth();

  const [modo, setModo] = useState<"entrar" | "criar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Já logado como admin: sai da tela de login.
  useEffect(() => {
    if (!carregando && session && isAdmin) {
      router.navigate({ to: "/obras" });
    }
  }, [carregando, session, isAdmin, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    const parsed = credenciaisSchema.safeParse({ email, senha });
    if (!parsed.success) {
      setMsg(parsed.error.issues[0].message);
      return;
    }

    setEnviando(true);
    try {
      if (modo === "criar") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.senha,
          options: { emailRedirectTo: window.location.origin + "/auth" },
        });
        if (error) {
          setMsg(error.message);
          return;
        }
        setMsg("Conta criada. Agora é só entrar.");
        setModo("entrar");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.senha,
        });
        if (error) {
          setMsg("E-mail ou senha incorretos.");
          return;
        }
      }
    } catch {
      setMsg("Não foi possível concluir. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <img
            src={marca.logoFirmaBranco}
            alt="Elifas Andreato — Além da Moldura"
            className="h-12 w-auto"
          />
          <h1 className="mt-6 font-serif text-2xl font-bold text-foreground">
            Acesso restrito
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Esta área é exclusiva para administradores.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1"
              required
            />
          </div>
          <div>
            <Label htmlFor="senha">Senha</Label>
            <Input
              id="senha"
              type="password"
              autoComplete={modo === "criar" ? "new-password" : "current-password"}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <Button type="submit" disabled={enviando} className="w-full min-h-11">
            {enviando && <Loader2 className="animate-spin" aria-hidden="true" />}
            <span>{modo === "criar" ? "Criar conta" : "Entrar"}</span>
          </Button>

          {msg && (
            <p className="text-sm text-muted-foreground" role="status">
              {msg}
            </p>
          )}
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setMsg(null);
              setModo((m) => (m === "criar" ? "entrar" : "criar"));
            }}
            className="text-sm text-accent hover:underline"
          >
            {modo === "criar"
              ? "Já tem conta? Entrar"
              : "Primeiro acesso? Criar conta"}
          </button>
        </div>
      </div>
    </div>
  );
}
