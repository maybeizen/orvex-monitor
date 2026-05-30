import { Router } from "express";

import {
  requireAuthenticatedAllowPending,
  requireAuthenticatedUser,
} from "../../middlewares/auth.middleware";
import { createAuthRateLimiter } from "../../middlewares/rate-limit.middleware";
import * as controller from "./account.controller";

export const accountRouter = Router();

accountRouter.get("/", ...requireAuthenticatedUser, controller.getAccount);
accountRouter.patch("/profile", ...requireAuthenticatedUser, controller.updateProfile);
accountRouter.get(
  "/username/check",
  ...requireAuthenticatedUser,
  controller.checkUsername,
);
accountRouter.post(
  "/avatar/upload-url",
  ...requireAuthenticatedUser,
  controller.createAvatarUploadUrl,
);
accountRouter.patch(
  "/email",
  createAuthRateLimiter(),
  ...requireAuthenticatedUser,
  controller.changeEmail,
);
accountRouter.patch(
  "/password",
  createAuthRateLimiter(),
  ...requireAuthenticatedUser,
  controller.changePassword,
);
accountRouter.get("/oauth", ...requireAuthenticatedUser, controller.getOAuth);
accountRouter.post("/oauth/sync", ...requireAuthenticatedUser, controller.syncOAuth);

accountRouter.post("/mfa/enroll", ...requireAuthenticatedUser, controller.enrollMfa);
accountRouter.post(
  "/mfa/confirm",
  createAuthRateLimiter(),
  ...requireAuthenticatedUser,
  controller.confirmMfa,
);
accountRouter.post(
  "/mfa/disable",
  createAuthRateLimiter(),
  ...requireAuthenticatedUser,
  controller.disableMfa,
);

accountRouter.post(
  "/deactivate",
  createAuthRateLimiter(),
  ...requireAuthenticatedUser,
  controller.deactivateAccount,
);
accountRouter.post(
  "/reactivate",
  ...requireAuthenticatedAllowPending,
  controller.reactivateAccount,
);
