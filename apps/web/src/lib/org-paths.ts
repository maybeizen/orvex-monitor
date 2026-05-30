export const LAST_ORG_SLUG_KEY = "orvex.lastOrgSlug";
export const SIDEBAR_EXPANDED_KEY = "orvex.sidebarExpanded";

export function getLastOrgSlug(): string | null {
  try {
    return localStorage.getItem(LAST_ORG_SLUG_KEY);
  } catch {
    return null;
  }
}

export function setLastOrgSlug(slug: string): void {
  try {
    localStorage.setItem(LAST_ORG_SLUG_KEY, slug);
  } catch {
    // Ignore storage failures.
  }
}

export function orgPath(slug: string, segment = ""): string {
  const base = `/app/org/${slug}`;
  if (!segment) return base;
  return `${base}/${segment.replace(/^\//, "")}`;
}

export function resolveAppEntryPath(
  organizations: Array<{ slug: string }>,
): string {
  if (organizations.length === 0) {
    return "/app/onboarding";
  }

  return "/app/organizations";
}
