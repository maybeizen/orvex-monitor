import { useParams } from "react-router";

export function useOrgSlug(): string | undefined {
  const { slug } = useParams<{ slug: string }>();
  return slug;
}
