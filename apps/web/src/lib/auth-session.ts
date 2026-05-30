import type { PublicUser } from "@orvex/types";

import { supabase } from "./supabase";

interface AuthUserResponse {
  data: {
    user: PublicUser;
    mfaRequired?: boolean;
    mfaVerified?: boolean;
  };
}

export interface BridgeSessionResult {
  user: PublicUser;
  mfaRequired: boolean;
  mfaVerified: boolean;
}

interface SessionStatusResponse {
  data: {
    authenticated: boolean;
    user: PublicUser;
  };
}

async function parseError(response: Response): Promise<string> {
  const body = await response.json().catch(() => ({}));
  return (body as { error?: string }).error ?? `HTTP ${response.status}`;
}

export async function bridgeSupabaseSession(): Promise<BridgeSessionResult> {
  const { data } = await supabase.auth.getSession();
  if (data.session === null) {
    throw new Error("No Supabase session available");
  }

  const response = await fetch("/api/v1/auth/session", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken: data.session.access_token }),
  });

  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = (await response.json()) as AuthUserResponse;
  return {
    user: body.data.user,
    mfaRequired: body.data.mfaRequired ?? false,
    mfaVerified: body.data.mfaVerified ?? true,
  };
}

export async function fetchApiUser(): Promise<PublicUser | null> {
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

export async function fetchSessionStatus(): Promise<PublicUser | null> {
  const response = await fetch("/api/v1/auth/session", {
    credentials: "include",
  });

  if (response.status === 401) return null;
  if (!response.ok) {
    throw new Error(await parseError(response));
  }

  const body = (await response.json()) as SessionStatusResponse;
  return body.data.user;
}

export async function fetchMfaStatus(): Promise<{
  mfaRequired: boolean;
  mfaVerified: boolean;
  pending: boolean;
}> {
  const response = await fetch("/api/v1/auth/mfa/status", { credentials: "include" });
  if (!response.ok) {
    throw new Error(await parseError(response));
  }
  const body = (await response.json()) as {
    data: { mfaRequired: boolean; mfaVerified: boolean; pending: boolean };
  };
  return body.data;
}

export async function logoutApiSession(): Promise<void> {
  const response = await fetch("/api/v1/auth/logout", {
    method: "DELETE",
    credentials: "include",
  });

  if (response.status !== 204 && !response.ok) {
    throw new Error(await parseError(response));
  }
}
