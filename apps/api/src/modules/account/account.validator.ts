import { UserAvatarType, UserStatus } from "@orvex/types";
import { z } from "zod";

import { usernameFieldSchema } from "./username.schema";

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
  username: usernameFieldSchema.optional(),
  avatarType: z.nativeEnum(UserAvatarType).optional(),
  avatarUrl: z.string().url().nullable().optional(),
  gravatarEmail: z.string().email().nullable().optional(),
  status: z.nativeEnum(UserStatus).optional(),
});

export const avatarUploadUrlSchema = z.object({
  contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
  extension: z.enum(["jpg", "jpeg", "png", "webp", "gif"]),
});

export const changeEmailSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6).optional(),
});

export const confirmEmailChangeSchema = z.object({
  token: z.string().min(1),
});

export const oauthProviderParamSchema = z.enum(["google", "github"]);

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
  otp: z.string().length(6).optional(),
});

export const mfaConfirmSchema = z.object({
  otp: z.string().length(6),
  password: z.string().min(1),
});

export const mfaDisableSchema = z.object({
  otp: z.string().min(6).max(12),
  password: z.string().min(1),
});

export const deactivateSchema = z.object({
  password: z.string().min(1),
  otp: z.string().min(6).max(12).optional(),
});

export const usernameCheckSchema = z.object({
  username: usernameFieldSchema,
});
