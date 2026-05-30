import { useSearchParams } from "react-router";

export function useAuthRedirectPath(defaultPath = "/app"): string {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect");
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return defaultPath;
  }
  return redirect;
}
