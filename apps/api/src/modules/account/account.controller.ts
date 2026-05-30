import { UserOAuthProvider } from "@orvex/types";
import type { NextFunction, Request, Response } from "express";

import type { AuthenticatedRequest } from "../../types/express";
import { ErrorCodes } from "../../constants/http";
import { startOAuthLink } from "../auth/auth.controller";
import {
  avatarUploadUrlSchema,
  changeEmailSchema,
  changePasswordSchema,
  confirmEmailChangeSchema,
  deactivateSchema,
  mfaConfirmSchema,
  mfaDisableSchema,
  oauthProviderParamSchema,
  updateProfileSchema,
  usernameCheckSchema,
} from "./account.validator";
import * as accountService from "./account.service";

function validationError(res: Response, message: string): void {
  res.status(400).json({
    error: message,
    statusCode: 400,
    code: ErrorCodes.VALIDATION,
  });
}

export async function getAccount(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const data = await accountService.getAccountSettings(userId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    const { firstName, lastName, username, avatarType, avatarUrl, gravatarEmail, status } =
      parsed.data;
    const user = await accountService.updateProfile(userId, {
      ...(firstName !== undefined ? { firstName } : {}),
      ...(lastName !== undefined ? { lastName } : {}),
      ...(username !== undefined ? { username } : {}),
      ...(avatarType !== undefined ? { avatarType } : {}),
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
      ...(gravatarEmail !== undefined ? { gravatarEmail } : {}),
      ...(status !== undefined ? { status } : {}),
    });
    res.json({ data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function checkUsername(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const parsed = usernameCheckSchema.safeParse(req.query);
    if (!parsed.success) {
      validationError(res, "Invalid username");
      return;
    }
    const data = await accountService.checkUsername(parsed.data.username, userId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function createAvatarUploadUrl(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const parsed = avatarUploadUrlSchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, "Invalid upload parameters");
      return;
    }
    const data = await accountService.createAvatarUploadUrl(
      userId,
      parsed.data.contentType,
      parsed.data.extension,
    );
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function changeEmail(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const parsed = changeEmailSchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    await accountService.requestEmailChange(userId, parsed.data.email, parsed.data.otp);
    res.json({ data: { sent: true } });
  } catch (err) {
    next(err);
  }
}

export async function confirmEmailChange(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = confirmEmailChangeSchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, "Invalid token");
      return;
    }

    const user = await accountService.confirmEmailChange(parsed.data.token);
    res.json({ data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function changePassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    await accountService.changePassword(
      userId,
      parsed.data.currentPassword,
      parsed.data.newPassword,
      parsed.data.otp,
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function getOAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const data = await accountService.getLinkedOAuth(userId);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function linkOAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  await startOAuthLink(req, res, next);
}

export async function unlinkOAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const parsed = oauthProviderParamSchema.safeParse(req.params.provider);
    if (!parsed.success) {
      validationError(res, "Invalid OAuth provider");
      return;
    }

    const provider =
      parsed.data === "google" ? UserOAuthProvider.Google : UserOAuthProvider.GitHub;
    const data = await accountService.unlinkOAuthProvider(userId, provider);
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function enrollMfa(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId, user } = req as AuthenticatedRequest;
    const data = await accountService.startMfaEnroll(userId, user.email);
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
}

export async function confirmMfa(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId, user } = req as AuthenticatedRequest;
    const parsed = mfaConfirmSchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, "Invalid input");
      return;
    }
    const data = await accountService.confirmMfaEnroll(
      userId,
      user.email,
      parsed.data.otp,
      parsed.data.password,
    );
    res.json({ data });
  } catch (err) {
    next(err);
  }
}

export async function disableMfa(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId, user } = req as AuthenticatedRequest;
    const parsed = mfaDisableSchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, "Invalid input");
      return;
    }
    await accountService.disableMfa(
      userId,
      user.email,
      parsed.data.otp,
      parsed.data.password,
    );
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function deactivateAccount(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId, user } = req as AuthenticatedRequest;
    const parsed = deactivateSchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, "Invalid input");
      return;
    }
    const profile = await accountService.deactivateAccount(
      userId,
      user.email,
      parsed.data.password,
      parsed.data.otp,
    );
    res.json({ data: { user: profile } });
  } catch (err) {
    next(err);
  }
}

export async function reactivateAccount(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const user = await accountService.reactivateAccount(userId);
    res.json({ data: { user } });
  } catch (err) {
    next(err);
  }
}
