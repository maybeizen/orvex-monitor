export function extractSecretFromOtpUri(uri: string): string {
  try {
    const url = new URL(uri);
    return url.searchParams.get("secret") ?? "";
  } catch {
    return "";
  }
}
