import { Router } from "express";

import {
  requireAuthenticatedUser,
  requireSession,
  loadUser,
  requireActiveUser,
} from "../../middlewares/auth.middleware";
import { createAuthRateLimiter } from "../../middlewares/rate-limit.middleware";
import {
  forgotPassword,
  getMe,
  getSessionStatus,
  githubAuth,
  githubCallback,
  googleAuth,
  googleCallback,
  login,
  logout,
  register,
  resendVerification,
  resetPassword,
  verifyEmail,
} from "./auth.controller";
import { getMfaStatus, verifyMfa } from "./mfa.controller";

export const authRouter = Router();

authRouter.post("/register", createAuthRateLimiter(), register);
authRouter.post("/login", createAuthRateLimiter(), login);
authRouter.post("/logout", ...requireAuthenticatedUser, logout);
authRouter.get("/me", ...requireAuthenticatedUser, getMe);
authRouter.get("/session", ...requireAuthenticatedUser, getSessionStatus);
authRouter.post("/verify-email", createAuthRateLimiter(), verifyEmail);
authRouter.post("/resend-verification", createAuthRateLimiter(), resendVerification);
authRouter.post("/forgot-password", createAuthRateLimiter(), forgotPassword);
authRouter.post("/reset-password", createAuthRateLimiter(), resetPassword);

authRouter.get("/google", googleAuth);
authRouter.get("/google/callback", googleCallback);
authRouter.get("/github", githubAuth);
authRouter.get("/github/callback", githubCallback);

const requireAuthNoMfa = [requireSession, loadUser, requireActiveUser] as const;

authRouter.get("/mfa/status", ...requireAuthNoMfa, getMfaStatus);
authRouter.post("/mfa/verify", createAuthRateLimiter(), ...requireAuthNoMfa, verifyMfa);
