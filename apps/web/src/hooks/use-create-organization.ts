import { useMutation, useQueryClient } from "@tanstack/react-query";

import type { ApiResponse, Organization, SubscriptionPlan } from "@orvex/types";

import { apiClient } from "@/lib/api-client";

export interface CreateOrganizationPayload {
  name: string;
  slug: string;
  icon?: string;
  orgType: "personal" | "team";
  plan: SubscriptionPlan;
}

export interface CreateOrganizationResponse {
  organization: Organization;
  checkoutStub: boolean;
  requestedPlan: SubscriptionPlan;
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateOrganizationPayload) =>
      apiClient.post<ApiResponse<CreateOrganizationResponse>>(
        "/organizations",
        payload,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });
}
