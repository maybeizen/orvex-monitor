import { useQuery } from "@tanstack/react-query";

import type { ApiResponse, Monitor } from "@orvex/types";

import { apiClient } from "@/lib/api-client";

export function useMonitors() {
  return useQuery({
    queryKey: ["monitors"],
    queryFn: () => apiClient.get<ApiResponse<Monitor[]>>("/monitors"),
    select: (res) => res.data,
  });
}

export function useMonitor(id: string) {
  return useQuery({
    queryKey: ["monitors", id],
    queryFn: () => apiClient.get<ApiResponse<Monitor>>(`/monitors/${id}`),
    select: (res) => res.data,
    enabled: id !== "",
  });
}
