import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

import { usersRepository } from "@orvex/database";

import type { AuthenticatedRequest } from "../../types/express";
import { ErrorCodes } from "../../constants/http";
import { AppError } from "../../utils/AppError";
import { verifyMfaCode } from "../account/mfa-account.service";

const mfaVerifySchema = z.object({
  otp: z.string().min(6).max(12),
});

export async function verifyMfa(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const parsed = mfaVerifySchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid code",
        statusCode: 400,
        code: ErrorCodes.VALIDATION,
      });
      return;
    }

    const profile = await usersRepository.findById(userId);
    if (!profile?.mfa_enabled) {
      throw new AppError("MFA is not enabled", 400, ErrorCodes.VALIDATION);
    }

    await verifyMfaCode(userId, parsed.data.otp);
    req.session.mfaVerified = true;

    req.session.save((err) => {
      if (err) {
        next(err);
        return;
      }
      res.json({ data: { verified: true } });
    });
  } catch (err) {
    next(err);
  }
}

export async function getMfaStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const mfaRequired = user.mfaEnabled;
    const mfaVerified = req.session.mfaVerified === true;

    res.json({
      data: {
        mfaRequired,
        mfaVerified: !mfaRequired || mfaVerified,
        pending: mfaRequired && !mfaVerified,
      },
    });
  } catch (err) {
    next(err);
  }
}
