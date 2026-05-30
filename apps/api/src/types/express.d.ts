import type { PublicUser } from "@orvex/types";
import type { Request } from "express";

declare global {
  namespace Express {
    interface User extends PublicUser {}

    interface Request {
      userId?: string;
      user?: PublicUser;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
    sessionVersion?: number;
    createdAt?: number;
    mfaVerified?: boolean;
    oauthLinkUserId?: string;
  }
}

export type AuthenticatedRequest = Request & {
  userId: string;
  user: PublicUser;
  session: Request["session"] & {
    userId: string;
  };
};
