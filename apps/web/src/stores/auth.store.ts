import type { PublicUser } from "@orvex/types";
import { create } from "zustand";

import {
  fetchMe,
  fetchSessionStatus,
  logout,
  type AuthSessionResult,
} from "@/lib/auth-api";

interface AuthState {
  apiUser: PublicUser | null;
  loading: boolean;
  setApiUser: (apiUser: PublicUser | null) => void;
  setLoading: (loading: boolean) => void;
  initialize: () => Promise<void>;
  refreshApiSession: () => Promise<void>;
  completeAuthFlow: () => Promise<AuthSessionResult>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  apiUser: null,
  loading: true,
  setApiUser: (apiUser) => { set({ apiUser }); },
  setLoading: (loading) => { set({ loading }); },

  initialize: async () => {
    set({ loading: true });
    try {
      const apiUser = await fetchMe();
      set({ apiUser });
    } catch {
      set({ apiUser: null });
    } finally {
      set({ loading: false });
    }
  },

  refreshApiSession: async () => {
    try {
      const apiUser = await fetchMe();
      set({ apiUser });
    } catch {
      set({ apiUser: null });
    }
  },

  completeAuthFlow: async () => {
    const session = await fetchSessionStatus();
    if (!session) {
      throw new Error("No active session");
    }
    set({ apiUser: session.user });
    return session;
  },

  signOut: async () => {
    await logout().catch(() => {
      void 0;
    });
    set({ apiUser: null });
  },
}));
