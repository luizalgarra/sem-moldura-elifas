import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Download, Trash2, Loader2, Video, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  listarPostagens,
  removerPostagem,
  type PostagemReels,
} from "@/lib/admin-obras.functions";

export const Route = createFileRoute("/postagens")({
  head: () => ({
    meta: [{ title: "Postagens — Reels salvos" }],
  }),
  component: PostagensPagina,
});

function formatarTamanho(bytes: number | null): string {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

function formatarData(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function PostagensPagina() {
  const buscar = useServerFn(listarPostagens);
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["postagens"],
    queryFn: () => buscar(),
  });

  return (
    <article className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/admin" className="text-sm font-medium text-accent hover:underline">
        ← Voltar à administração
      </Link>

      <header className="mt-4">
        <p className="text-sm font-medium uppercase tracking-wide text-accent">
          Administração
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-foreground sm:text-4xl">
          Postagens
        </h1>
        <p className="mt-1 text-muted-foreground">
          Reels salvos automaticamente ao gerar vídeos nas obras. Reproduza,
          baixe e exclua.
        </p>
      </header>

      <div className="mt-8">
        {isLoading && (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Carregando postagens…
          </p>
        )}

        {isError && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>Não foi possível carregar as postagens.</span>
          </div>
        )}

        {data && data.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/50 p-6 text-center text-sm text-muted-foreground">
            <Video className="mx-auto mb-2 size-8" aria-hidden="true" />
            Nenhuma postagem salva ainda. Gere um reels em uma obra para que ele
            apareça aqui.
          </div>
        )}

        {data && data.length > 0 && (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((p) => (
              <CartaoPostagem
                key={p.id}
                postagem={p}
                onRemovido={() =>
                  queryClient.invalidateQueries({ queryKey: ["postagens"] })
                }
              />
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

function CartaoPostagem({
  postagem,
  onRemovido,
}: {
  postagem: PostagemReels;
  onRemovido: () => void;
}) {
  const excluir = useServerFn(removerPostagem);
  const [confirmando, setConfirmando] = useState(false);

  const mutation = useMutation({
    mutationFn: () => excluir({ data: { id: postagem.id } }),
    onSuccess: () => onRemovido(),
  });

  return (
    <li className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
      <div className="bg-black">
        <video
          src={postagem.url}
          controls
          playsInline
          className="mx-auto max-h-[60vh] w-full object-contain"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="font-medium text-foreground">
          {postagem.titulo || `Obra ${postagem.num}`}
        </p>
        <p className="text-xs text-muted-foreground">
          Obra {postagem.num} · {formatarData(postagem.criadoEm)}
          {postagem.tamanhoBytes
            ? ` · ${formatarTamanho(postagem.tamanhoBytes)}`
            : ""}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="min-h-10">
            <a
              href={postagem.url}
              download={`obra-${postagem.num}-reels.${postagem.ext}`}
            >
              <Download aria-hidden="true" />
              <span>Baixar</span>
            </a>
          </Button>

          {confirmando ? (
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                className="min-h-10"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate()}
              >
                {mutation.isPending ? (
                  <Loader2 className="animate-spin" aria-hidden="true" />
                ) : (
                  <Trash2 aria-hidden="true" />
                )}
                <span>Confirmar</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="min-h-10"
                disabled={mutation.isPending}
                onClick={() => setConfirmando(false)}
              >
                Cancelar
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="min-h-10 text-destructive hover:text-destructive"
              onClick={() => setConfirmando(true)}
            >
              <Trash2 aria-hidden="true" />
              <span>Excluir</span>
            </Button>
          )}
        </div>

        {mutation.isError && (
          <p className="mt-2 text-xs text-destructive">
            Não foi possível excluir. Tente novamente.
          </p>
        )}
      </div>
    </li>
  );
}
