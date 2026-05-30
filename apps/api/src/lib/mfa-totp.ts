import { authenticator } from "otplib";

const ISSUER = "Orvex";

export function generateTotpSecret(): string {
  return authenticator.generateSecret();
}

export function buildOtpAuthUri(email: string, secret: string): string {
  return authenticator.keyuri(email, ISSUER, secret);
}

export function verifyTotp(secret: string, token: string): boolean {
  try {
    return authenticator.verify({ token, secret });
  } catch {
    return false;
  }
}

export function getTotpPreview(secret: string): string {
  const preview = secret.slice(0, 4);
  return `${preview}••••`;
}

export { ISSUER };
