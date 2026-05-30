import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import type { ApiResponse, Organization } from "@orvex/types";

import { apiClient } from "@/lib/api-client";
import { useOrgStore } from "@/stores/org.store";

export function useOrganization(slug: string | undefined) {
  const selectOrganization = useOrgStore((s) => s.selectOrganization);

  const query = useQuery({
    queryKey: ["organizations", slug],
    queryFn: () =>
      apiClient.get<ApiResponse<{ organization: Organization }>>(
        `/organizations/${slug}`,
      ),
    select: (res) => res.data.organization,
    enabled: Boolean(slug),
  });

  useEffect(() => {
    if (slug && query.data) {
      selectOrganization(slug);
    }
  }, [slug, query.data, selectOrganization]);

  return query;
}
