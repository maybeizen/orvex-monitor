const SLUG_PATTERN = /^[a-z0-9-]+$/;

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export function isValidSlug(value: string): boolean {
  return value.length >= 2 && value.length <= 50 && SLUG_PATTERN.test(value);
}
