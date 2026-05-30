import { useOrganizations } from "@/hooks/use-organizations";
import { resolveAppEntryPath } from "@/lib/org-paths";

export function useAppEntryPath(): string {
  const { data: organizations, isLoading } = useOrganizations();
  if (isLoading || !organizations) return "/app";
  return resolveAppEntryPath(organizations);
}
