import type { NextFunction, Request, Response } from "express";

import { AppError } from "../utils/AppError";
import { ErrorCodes } from "../constants/http";

export function requireMfaVerified(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  const user = req.user;
  if (!user) {
    next(new AppError("Unauthorized", 401, ErrorCodes.UNAUTHORIZED));
    return;
  }

  if (user.mfaEnabled && req.session.mfaVerified !== true) {
    next(new AppError("Two-factor verification required", 403, ErrorCodes.MFA_PENDING));
    return;
  }

  next();
}
