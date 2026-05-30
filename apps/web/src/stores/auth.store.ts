import type { PublicUser } from "@orvex/types";
import type { User } from "@supabase/supabase-js";
import { create } from "zustand";

import {
  bridgeSupabaseSession,
  fetchApiUser,
  logoutApiSession,
  type BridgeSessionResult,
} from "@/lib/auth-session";
import { supabase } from "@/lib/supabase";

interface AuthState {
  user: User | null;
  apiUser: PublicUser | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setApiUser: (apiUser: PublicUser | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  refreshApiSession: () => Promise<void>;
  completeAuthFlow: () => Promise<BridgeSessionResult>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  apiUser: null,
  loading: true,
  setUser: (user) => { set({ user }); },
  setApiUser: (apiUser) => { set({ apiUser }); },
  setLoading: (loading) => { set({ loading }); },

  initialize: async () => {
    set({ loading: true });
    try {
      const { data } = await supabase.auth.getSession();
      const supabaseUser = data.session?.user ?? null;
      set({ user: supabaseUser });

      if (supabaseUser) {
        const session = await bridgeSupabaseSession();
        set({ apiUser: session.user });
      } else {
        const apiUser = await fetchApiUser();
        set({ apiUser });
      }
    } catch {
      set({ apiUser: null });
    } finally {
      set({ loading: false });
    }
  },

  refreshApiSession: async () => {
    const { data } = await supabase.auth.getSession();
    const supabaseUser = data.session?.user ?? null;
    set({ user: supabaseUser });

    if (!supabaseUser) {
      set({ apiUser: null });
      return;
    }

    try {
      const session = await bridgeSupabaseSession();
      set({ apiUser: session.user });
    } catch {
      set({ apiUser: null });
    }
  },

  completeAuthFlow: async () => {
    const { data } = await supabase.auth.getSession();
    const supabaseUser = data.session?.user ?? null;
    if (!supabaseUser) {
      throw new Error("No active session");
    }

    set({ user: supabaseUser });
    const session = await bridgeSupabaseSession();
    set({ apiUser: session.user });
    return session;
  },

  signOut: async () => {
    try {
      await logoutApiSession();
    } catch {
      // Continue local sign-out even if API logout fails.
    }
    await supabase.auth.signOut();
    set({ user: null, apiUser: null });
  },
}));
