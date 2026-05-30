import type { PublicUser } from "@orvex/types";
import type { Request } from "express";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
      user?: PublicUser;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    userId?: string;
    supabaseUserId?: string;
    sessionVersion?: number;
    createdAt?: number;
    mfaVerified?: boolean;
  }
}

export type AuthenticatedRequest = Request & {
  userId: string;
  user: PublicUser;
  session: Request["session"] & {
    userId: string;
  };
};
