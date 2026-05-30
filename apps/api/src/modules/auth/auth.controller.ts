import type { NextFunction, Request, Response } from "express";
import passport from "passport";

import { UserOAuthProvider } from "@orvex/types";
import { usersRepository } from "@orvex/database";

import { getEnv } from "../../config/env";
import type { OAuthProfile } from "../../config/passport";
import type { AuthenticatedRequest } from "../../types/express";
import { ErrorCodes } from "../../constants/http";
import { AppError } from "../../utils/AppError";
import {
  destroySession,
  getCurrentUser,
  linkOAuthAccount,
  loginWithPassword,
  registerUser,
  regenerateAndEstablishSession,
  requestPasswordReset,
  resendVerificationEmail,
  resetPasswordWithToken,
  resolveOAuthLogin,
  verifyEmailToken,
} from "./auth.service";
import {
  forgotPasswordBodySchema,
  loginBodySchema,
  registerBodySchema,
  resendVerificationBodySchema,
  resetPasswordBodySchema,
  verifyEmailBodySchema,
} from "./auth.validator";

function sessionCookieOptions() {
  const env = getEnv();
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
  };
}

function validationError(res: Response, message: string): void {
  res.status(400).json({
    error: message,
    statusCode: 400,
    code: ErrorCodes.VALIDATION,
  });
}

function oauthRedirectPath(mfaRequired: boolean): string {
  const env = getEnv();
  return mfaRequired ? `${env.WEB_ORIGIN}/auth/two-factor` : `${env.WEB_ORIGIN}/app`;
}

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = registerBodySchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    const user = await registerUser(parsed.data);
    res.status(201).json({ data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = loginBodySchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    const { user, mfaRequired } = await loginWithPassword(
      parsed.data.email,
      parsed.data.password,
    );
    await regenerateAndEstablishSession(req, user.id, {
      mfaRequired,
      mfaVerified: !mfaRequired,
    });
    await usersRepository.updateLastLogin(user.id);

    res.json({
      data: {
        user,
        mfaRequired,
        mfaVerified: !mfaRequired,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getSessionStatus(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId, user } = req as AuthenticatedRequest;
    res.json({
      data: {
        authenticated: true,
        user: user ?? (await getCurrentUser(userId)),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId, user } = req as AuthenticatedRequest;
    res.json({ data: { user: user ?? (await getCurrentUser(userId)) } });
  } catch (err) {
    next(err);
  }
}

export async function logout(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    await destroySession(req);
    res.clearCookie(getEnv().SESSION_COOKIE_NAME, sessionCookieOptions());
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function verifyEmail(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = verifyEmailBodySchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, "Invalid token");
      return;
    }

    const user = await verifyEmailToken(parsed.data.token);
    res.json({ data: { user } });
  } catch (err) {
    next(err);
  }
}

export async function resendVerification(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = resendVerificationBodySchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, "Invalid email");
      return;
    }

    await resendVerificationEmail(parsed.data.email);
    res.json({ data: { sent: true } });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = forgotPasswordBodySchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, "Invalid email");
      return;
    }

    await requestPasswordReset(parsed.data.email);
    res.json({ data: { sent: true } });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const parsed = resetPasswordBodySchema.safeParse(req.body);
    if (!parsed.success) {
      validationError(res, parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    await resetPasswordWithToken(parsed.data.token, parsed.data.password);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

function startOAuth(provider: "google" | "github") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const env = getEnv();
    if (provider === "google" && (!env.GOOGLE_CLIENT_ID || !env.GOOGLE_CLIENT_SECRET)) {
      next(new AppError("Google OAuth is not configured", 503, ErrorCodes.INTERNAL));
      return;
    }
    if (provider === "github" && (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET)) {
      next(new AppError("GitHub OAuth is not configured", 503, ErrorCodes.INTERNAL));
      return;
    }

    passport.authenticate(provider, { session: false })(req, res, next);
  };
}

function handleOAuthCallback(provider: "google" | "github") {
  return (req: Request, res: Response, next: NextFunction): void => {
    passport.authenticate(
      provider,
      { session: false },
      async (err: Error | null, profile: OAuthProfile | false) => {
        try {
          if (err || !profile) {
            res.redirect(`${getEnv().WEB_ORIGIN}/auth/login?error=oauth`);
            return;
          }

          const linkUserId = req.session.oauthLinkUserId;
          if (linkUserId) {
            delete req.session.oauthLinkUserId;
            await linkOAuthAccount(linkUserId, profile);
            req.session.save((saveErr) => {
              if (saveErr) {
                next(saveErr);
                return;
              }
              res.redirect(`${getEnv().WEB_ORIGIN}/app/account/security`);
            });
            return;
          }

          const { user, mfaRequired } = await resolveOAuthLogin(profile);
          await regenerateAndEstablishSession(req, user.id, {
            mfaRequired,
            mfaVerified: !mfaRequired,
          });
          await usersRepository.updateLastLogin(user.id);
          res.redirect(oauthRedirectPath(mfaRequired));
        } catch (callbackErr) {
          next(callbackErr);
        }
      },
    )(req, res, next);
  };
}

export const googleAuth = startOAuth("google");
export const googleCallback = handleOAuthCallback("google");
export const githubAuth = startOAuth("github");
export const githubCallback = handleOAuthCallback("github");

export async function startOAuthLink(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const provider = req.params.provider;

    if (provider !== UserOAuthProvider.Google && provider !== UserOAuthProvider.GitHub) {
      validationError(res, "Invalid OAuth provider");
      return;
    }

    req.session.oauthLinkUserId = userId;
    req.session.save((err) => {
      if (err) {
        next(err);
        return;
      }

      if (provider === UserOAuthProvider.Google) {
        googleAuth(req, res, next);
        return;
      }
      githubAuth(req, res, next);
    });
  } catch (err) {
    next(err);
  }
}
