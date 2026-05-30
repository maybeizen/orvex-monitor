import type { Organization } from "@orvex/types";
import { create } from "zustand";

import { setLastOrgSlug } from "@/lib/org-paths";

interface OrgState {
  organizations: Organization[];
  currentSlug: string | null;
  setOrganizations: (organizations: Organization[]) => void;
  setCurrentSlug: (slug: string | null) => void;
  selectOrganization: (slug: string) => void;
}

export const useOrgStore = create<OrgState>((set) => ({
  organizations: [],
  currentSlug: null,
  setOrganizations: (organizations) => { set({ organizations }); },
  setCurrentSlug: (currentSlug) => { set({ currentSlug }); },
  selectOrganization: (slug) => {
    setLastOrgSlug(slug);
    set({ currentSlug: slug });
  },
}));
