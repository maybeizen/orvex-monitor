import type { PublicUser } from "@orvex/types";

import { apiClient } from "./api-client";

export interface SignUpInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
}

export interface AuthSessionResult {
  user: PublicUser;
  mfaRequired: boolean;
  mfaVerified: boolean;
}

export interface RegisterResult {
  user?: PublicUser;
  emailVerificationRequired: boolean;
}

interface AuthUserResponse {
  data: {
    user: PublicUser;
    mfaRequired?: boolean;
    mfaVerified?: boolean;
    emailVerificationRequired?: boolean;
  };
}

interface SessionStatusResponse {
  data: {
    authenticated: boolean;
    user: PublicUser;
    mfaRequired?: boolean;
    mfaVerified?: boolean;
  };
}

async function parseError(response: Response): Promise<string> {
  const body = await response.json().catch(() => ({}));
  return (body as { error?: string }).error ?? `HTTP ${response.status}`;
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export async function login(email: string, password: string): Promise<AuthSessionResult> {
  const body = await apiClient.post<AuthUserResponse>("/auth/login", { email, password });
  return {
    user: body.data.user,
    mfaRequired: body.data.mfaRequired ?? false,
    mfaVerified: body.data.mfaVerified ?? true,
  };
}

export async function register(input: SignUpInput): Promise<RegisterResult> {
  const body = await apiClient.post<AuthUserResponse>("/auth/register", input);
  return {
    ...(body.data.user ? { user: body.data.user } : {}),
    emailVerificationRequired: body.data.emailVerificationRequired ?? !body.data.user,
  };
}

export async function logout(): Promise<void> {
  await apiClient.post<void>("/auth/logout", {});
}

export async function fetchMe(): Promise<PublicUser | null> {
  const response = await fetch("/api/v1/auth/me", {
    credentials: "include",
  });

  if (response.status === 401) return null;
  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = (await response.json()) as AuthUserResponse;
  return body.data.user;
}

export async function fetchSessionStatus(): Promise<AuthSessionResult | null> {
  const response = await fetch("/api/v1/auth/session", {
    credentials: "include",
  });

  if (response.status === 401) return null;
  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = (await response.json()) as SessionStatusResponse;
  return {
    user: body.data.user,
    mfaRequired: body.data.mfaRequired ?? false,
    mfaVerified: body.data.mfaVerified ?? true,
  };
}

export async function verifyEmail(token: string): Promise<PublicUser> {
  const body = await apiClient.post<AuthUserResponse>("/auth/verify-email", { token });
  return body.data.user;
}

export async function resendVerification(email: string): Promise<void> {
  await apiClient.post<void>("/auth/resend-verification", { email });
}

export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post<void>("/auth/forgot-password", { email });
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await apiClient.post<void>("/auth/reset-password", { token, password });
}

export async function fetchMfaStatus(): Promise<{
  mfaRequired: boolean;
  mfaVerified: boolean;
  pending: boolean;
}> {
  const body = await apiClient.get<{
    data: { mfaRequired: boolean; mfaVerified: boolean; pending: boolean };
  }>("/auth/mfa/status");
  return body.data;
}

export type OAuthProvider = "google" | "github";

export function startOAuthSignIn(provider: OAuthProvider): void {
  window.location.assign(`/api/v1/auth/${provider}`);
}

export function startOAuthLink(provider: OAuthProvider): void {
  window.location.assign(`/api/v1/auth/${provider}?link=1`);
}

export async function unlinkOAuthProvider(provider: OAuthProvider): Promise<void> {
  await apiClient.delete(`/account/oauth/${provider}`);
}
