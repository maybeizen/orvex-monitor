import { useQuery } from "@tanstack/react-query";

import type { ApiResponse, OrganizationListItem } from "@orvex/types";

import { apiClient } from "@/lib/api-client";
import { useOrgStore } from "@/stores/org.store";

export function useOrganizations() {
  const setOrganizations = useOrgStore((s) => s.setOrganizations);

  return useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<{ organizations: OrganizationListItem[] }>>(
        "/organizations",
      );
      setOrganizations(res.data.organizations);
      return res.data.organizations;
    },
  });
}
