import type { UserGlobalRole } from "@orvex/types";
import type { NextFunction, Request, Response } from "express";

import { mapProfileToPublicUser, usersRepository } from "@orvex/database";

import { ErrorCodes } from "../constants/http";
import { AppError } from "../utils/AppError";
import { requireMfaVerified } from "./mfa.middleware";

export function requireSession(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const userId = req.session.userId;
  if (!userId) {
    next(new AppError("Unauthorized", 401, ErrorCodes.UNAUTHORIZED));
    return;
  }
  req.userId = userId;
  next();
}

export async function loadUser(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const userId = req.userId ?? req.session.userId;
    if (!userId) {
      next(new AppError("Unauthorized", 401, ErrorCodes.UNAUTHORIZED));
      return;
    }

    const profile = await usersRepository.findById(userId);
    if (!profile) {
      next(new AppError("User profile not found", 404, ErrorCodes.NOT_FOUND));
      return;
    }

    if (profile.deleted_at) {
      next(new AppError("Account has been deleted", 410, ErrorCodes.ACCOUNT_DELETED));
      return;
    }

    req.userId = userId;
    req.user = mapProfileToPublicUser(profile);
    next();
  } catch (err) {
    next(err);
  }
}

export function requireActiveUser(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const user = req.user;
  if (!user) {
    next(new AppError("Unauthorized", 401, ErrorCodes.UNAUTHORIZED));
    return;
  }

  if (user.isBanned) {
    next(new AppError("Account is banned", 403, ErrorCodes.ACCOUNT_BANNED));
    return;
  }

  if (user.pendingDeletion) {
    next(
      new AppError(
        "Account is pending deletion",
        403,
        ErrorCodes.ACCOUNT_PENDING_DELETION,
      ),
    );
    return;
  }

  next();
}

export const requireAuthenticatedAllowPending = [requireSession, loadUser] as const;

export function requireGlobalRole(...roles: UserGlobalRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = req.user;
    if (!user) {
      next(new AppError("Unauthorized", 401, ErrorCodes.UNAUTHORIZED));
      return;
    }

    if (!roles.includes(user.role)) {
      next(new AppError("Forbidden", 403, ErrorCodes.FORBIDDEN));
      return;
    }

    next();
  };
}

export const requireAuthenticatedUser = [
  requireSession,
  loadUser,
  requireActiveUser,
  requireMfaVerified,
] as const;
