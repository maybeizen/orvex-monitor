import { useEffect, type ReactNode } from "react";

import { useAuthStore } from "@/stores/auth.store";
import { supabase } from "@/lib/supabase";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuthStore((s) => s.initialize);
  const refreshApiSession = useAuthStore((s) => s.refreshApiSession);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        void refreshApiSession();
      }
      if (event === "SIGNED_OUT") {
        useAuthStore.setState({ user: null, apiUser: null });
      }
    });
    return () => { listener.subscription.unsubscribe(); };
  }, [refreshApiSession]);

  return children;
}
