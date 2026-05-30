import { create } from "zustand";

import { SIDEBAR_EXPANDED_KEY } from "@/lib/org-paths";

function readExpandedPreference(): boolean {
  try {
    return localStorage.getItem(SIDEBAR_EXPANDED_KEY) === "true";
  } catch {
    return false;
  }
}

interface SidebarState {
  expanded: boolean;
  toggle: () => void;
  setExpanded: (expanded: boolean) => void;
}

export const useSidebarStore = create<SidebarState>((set, get) => ({
  expanded: readExpandedPreference(),
  toggle: () => {
    const next = !get().expanded;
    try {
      localStorage.setItem(SIDEBAR_EXPANDED_KEY, String(next));
    } catch {
      // Ignore storage failures.
    }
    set({ expanded: next });
  },
  setExpanded: (expanded) => {
    try {
      localStorage.setItem(SIDEBAR_EXPANDED_KEY, String(expanded));
    } catch {
      // Ignore storage failures.
    }
    set({ expanded });
  },
}));
