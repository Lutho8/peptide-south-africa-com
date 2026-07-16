import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthCtx {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  hasFirstOrder: boolean | null;
  refreshOrders: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasFirstOrder, setHasFirstOrder] = useState<boolean | null>(null);

  const cacheKey = (uid: string) => `psa_has_first_order_${uid}`;

  const checkRoleAndOrders = async (uid: string | undefined) => {
    if (!uid) {
      setIsAdmin(false);
      setHasFirstOrder(null);
      return;
    }
    // Hydrate from cache immediately to avoid re-querying on every auth event.
    try {
      const cached = typeof window !== "undefined" ? window.localStorage.getItem(cacheKey(uid)) : null;
      if (cached === "true" || cached === "false") {
        setHasFirstOrder(cached === "true");
      }
    } catch { /* ignore */ }

    // Defer queries with setTimeout to avoid deadlock with onAuthStateChange
    setTimeout(async () => {
      const { data: roleData } = await supabase
        .from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
      setIsAdmin(!!roleData);

      // Only query orders once per user; cached answer is reused across auth events.
      const cached = typeof window !== "undefined" ? window.localStorage.getItem(cacheKey(uid)) : null;
      if (cached === "true" || cached === "false") return;

      const { count, error } = await supabase
        .from("orders").select("id", { count: "exact", head: true }).eq("user_id", uid);
      if (error) return;
      const has = (count ?? 0) > 0;
      setHasFirstOrder(has);
      try { window.localStorage.setItem(cacheKey(uid), String(has)); } catch { /* ignore */ }
    }, 0);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, sess) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      checkRoleAndOrders(sess?.user?.id);
      // Push new signups to Nocobase CRM
      if (event === "SIGNED_IN" && sess?.user) {
        const isNew = sess.user.created_at &&
          Date.now() - new Date(sess.user.created_at).getTime() < 60_000;
        if (isNew) {
          import("@/lib/nocobase").then(({ captureLead }) => {
            captureLead({
              source: "signup",
              email: sess.user.email ?? null,
              extra: { user_id: sess.user.id },
            });
          });
        }
      }
    });

    supabase.auth.getSession().then(({ data: { session: sess } }) => {
      setSession(sess);
      setUser(sess?.user ?? null);
      checkRoleAndOrders(sess?.user?.id);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshOrders = async () => {
    if (!user) return;
    const { count } = await supabase.from("orders").select("id", { count: "exact", head: true }).eq("user_id", user.id);
    const has = (count ?? 0) > 0;
    setHasFirstOrder(has);
    try { window.localStorage.setItem(cacheKey(user.id), String(has)); } catch { /* ignore */ }
  };

  const signOut = async () => {
    try {
      if (user) window.localStorage.removeItem(cacheKey(user.id));
    } catch { /* ignore */ }
    await supabase.auth.signOut();
  };

  return (
    <Ctx.Provider value={{ session, user, loading, isAdmin, hasFirstOrder, refreshOrders, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
