import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AdminAuth = {
  carregando: boolean;
  session: Session | null;
  isAdmin: boolean;
  sair: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuth | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [carregando, setCarregando] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const verificarAdmin = useCallback(async (sess: Session | null) => {
    if (!sess) {
      setIsAdmin(false);
      return;
    }
    const { data, error } = await supabase.rpc("is_admin");
    setIsAdmin(!error && data === true);
  }, []);

  useEffect(() => {
    let ativo = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!ativo) return;
      setSession(data.session);
      await verificarAdmin(data.session);
      if (ativo) setCarregando(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      // Adia a chamada ao backend para fora do callback do listener.
      setTimeout(() => {
        verificarAdmin(sess);
      }, 0);
    });

    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, [verificarAdmin]);

  const sair = useCallback(async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  }, []);

  return (
    <AdminAuthContext.Provider value={{ carregando, session, isAdmin, sair }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error("useAdminAuth deve ser usado dentro de AdminAuthProvider");
  }
  return ctx;
}
