import { useQuery } from "@tanstack/react-query";

import type { ApiResponse } from "@orvex/types";

import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { apiClient } from "@/lib/api-client";
import { isValidSlug } from "@/lib/slug";

export function useSlugAvailability(slug: string) {
  const debouncedSlug = useDebouncedValue(slug.trim(), 350);
  const canCheck = isValidSlug(debouncedSlug);

  const query = useQuery({
    queryKey: ["organizations", "check-slug", debouncedSlug],
    queryFn: () =>
      apiClient.get<ApiResponse<{ available: boolean }>>(
        `/organizations/check-slug/${encodeURIComponent(debouncedSlug)}`,
      ),
    select: (res) => res.data.available,
    enabled: canCheck,
    staleTime: 30_000,
    retry: 1,
  });

  const isChecking =
    canCheck &&
    (slug.trim() !== debouncedSlug || query.isFetching || query.isLoading);

  return {
    slug: debouncedSlug,
    canCheck,
    available: canCheck ? query.data : undefined,
    isChecking,
    isError: query.isError,
    error: query.error,
  };
}
