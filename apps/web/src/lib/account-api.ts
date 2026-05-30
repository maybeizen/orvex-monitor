import type { AccountSettings, ApiResponse, PublicUser } from "@orvex/types";
import { UserAvatarType, UserOAuthProvider, UserStatus } from "@orvex/types";

import { apiClient } from "./api-client";
import { bridgeSupabaseSession } from "./auth-session";
import { requestEmailChange } from "./auth";

export interface AvatarUploadUrlResult {
  signedUrl: string;
  token: string;
  path: string;
  publicUrl: string;
}

export interface MfaEnrollResult {
  qrUri: string;
  secretPreview: string;
}

export interface MfaConfirmResult {
  backupCodes: string[];
}

export function fetchAccount() {
  return apiClient.get<ApiResponse<AccountSettings>>("/account");
}

export function updateProfile(body: {
  firstName?: string;
  lastName?: string;
  username?: string;
  avatarType?: UserAvatarType;
  avatarUrl?: string | null;
  gravatarEmail?: string | null;
  status?: UserStatus;
}) {
  return apiClient.patch<ApiResponse<{ user: PublicUser }>>("/account/profile", body);
}

export function checkUsername(username: string) {
  return apiClient.get<ApiResponse<{ available: boolean }>>(
    `/account/username/check?username=${encodeURIComponent(username)}`,
  );
}

export function createAvatarUploadUrl(contentType: string, extension: string) {
  return apiClient.post<ApiResponse<AvatarUploadUrlResult>>("/account/avatar/upload-url", {
    contentType,
    extension,
  });
}

export async function changeEmail(email: string, otp?: string) {
  await apiClient.patch<ApiResponse<{ authorized: true }>>("/account/email", {
    email,
    ...(otp ? { otp } : {}),
  });

  await requestEmailChange(email);

  const result = await apiClient.patch<ApiResponse<{ user: PublicUser }>>("/account/email", {
    email,
    syncProfile: true,
  });

  await bridgeSupabaseSession();
  return result;
}

export function changePassword(
  currentPassword: string,
  newPassword: string,
  otp?: string,
) {
  return apiClient.patch<void>("/account/password", {
    currentPassword,
    newPassword,
    otp,
  });
}

export function fetchOAuth() {
  return apiClient.get<ApiResponse<{ linkedProviders: UserOAuthProvider[] }>>("/account/oauth");
}

export function syncOAuth() {
  return apiClient.post<ApiResponse<{ linkedProviders: UserOAuthProvider[] }>>(
    "/account/oauth/sync",
    {},
  );
}

export function enrollMfa() {
  return apiClient.post<ApiResponse<MfaEnrollResult>>("/account/mfa/enroll", {});
}

export function confirmMfa(otp: string, password: string) {
  return apiClient.post<ApiResponse<MfaConfirmResult>>("/account/mfa/confirm", {
    otp,
    password,
  });
}

export function disableMfa(otp: string, password: string) {
  return apiClient.post<void>("/account/mfa/disable", { otp, password });
}

export function deactivateAccount(password: string, otp?: string) {
  return apiClient.post<ApiResponse<{ user: PublicUser }>>("/account/deactivate", {
    password,
    otp,
  });
}

export function reactivateAccount() {
  return apiClient.post<ApiResponse<{ user: PublicUser }>>("/account/reactivate", {});
}

export function verifyMfaLogin(otp: string) {
  return apiClient.post<ApiResponse<{ verified: boolean }>>("/auth/mfa/verify", { otp });
}

export function fetchMfaStatus() {
  return apiClient.get<
    ApiResponse<{ mfaRequired: boolean; mfaVerified: boolean; pending: boolean }>
  >("/auth/mfa/status");
}
