import { Router } from "express";

import {
  requireAuthenticatedUser,
  requireSession,
  loadUser,
  requireActiveUser,
} from "../../middlewares/auth.middleware";
import { createAuthRateLimiter } from "../../middlewares/rate-limit.middleware";
import { createSession, getMe, getSessionStatus, logout } from "./auth.controller";
import { getMfaStatus, verifyMfa } from "./mfa.controller";

export const authRouter = Router();

authRouter.post("/session", createAuthRateLimiter(), createSession);
authRouter.get("/session", ...requireAuthenticatedUser, getSessionStatus);
authRouter.get("/me", ...requireAuthenticatedUser, getMe);
authRouter.delete("/logout", ...requireAuthenticatedUser, logout);
const requireAuthNoMfa = [requireSession, loadUser, requireActiveUser] as const;

authRouter.get("/mfa/status", ...requireAuthNoMfa, getMfaStatus);
authRouter.post("/mfa/verify", createAuthRateLimiter(), ...requireAuthNoMfa, verifyMfa);
