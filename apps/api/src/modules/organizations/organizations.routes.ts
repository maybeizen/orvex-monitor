import { Router } from "express";

import { requireAuthenticatedUser } from "../../middlewares/auth.middleware";
import {
  checkOrganizationSlug,
  createIconUploadUrl,
  createOrganization,
  getOrganizationBySlug,
  listOrganizations,
} from "./organizations.controller";

export const organizationsRouter = Router();

organizationsRouter.get("/", ...requireAuthenticatedUser, listOrganizations);
organizationsRouter.post(
  "/icon-upload-url",
  ...requireAuthenticatedUser,
  createIconUploadUrl,
);
organizationsRouter.get(
  "/check-slug/:slug",
  ...requireAuthenticatedUser,
  checkOrganizationSlug,
);
organizationsRouter.post("/", ...requireAuthenticatedUser, createOrganization);
organizationsRouter.get("/:slug", ...requireAuthenticatedUser, getOrganizationBySlug);
