import type { NextFunction, Request, Response } from "express";

import { ErrorCodes } from "../../constants/http";
import type { AuthenticatedRequest } from "../../types/express";
import {
  createOrganizationIconUploadUrl,
  createOrganizationForUser,
  checkSlugAvailability,
  getOrganizationForUser,
  listOrganizationsForUser,
} from "./organizations.service";
import {
  createOrganizationSchema,
  iconUploadUrlSchema,
  slugSchema,
} from "../../schemas/organization";

export async function listOrganizations(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const organizations = await listOrganizationsForUser(userId);
    res.json({ data: { organizations } });
  } catch (err) {
    next(err);
  }
}

export async function getOrganizationBySlug(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const slugParam = req.params.slug;
    if (typeof slugParam !== "string") {
      res.status(400).json({
        error: "Missing slug",
        statusCode: 400,
        code: ErrorCodes.VALIDATION,
      });
      return;
    }

    const organization = await getOrganizationForUser(slugParam, userId);
    res.json({ data: { organization } });
  } catch (err) {
    next(err);
  }
}

export async function checkOrganizationSlug(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const slugParam = req.params.slug;
    if (typeof slugParam !== "string") {
      res.status(400).json({
        error: "Invalid slug",
        statusCode: 400,
        code: ErrorCodes.VALIDATION,
      });
      return;
    }

    const parsed = slugSchema.safeParse(slugParam);
    if (!parsed.success) {
      res.status(400).json({
        error: "Invalid slug",
        statusCode: 400,
        code: ErrorCodes.VALIDATION,
      });
      return;
    }

    const result = await checkSlugAvailability(parsed.data);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function createOrganization(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { user } = req as AuthenticatedRequest;
    const parsed = createOrganizationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message ?? "Invalid request body",
        statusCode: 400,
        code: ErrorCodes.VALIDATION,
      });
      return;
    }

    const result = await createOrganizationForUser(user, parsed.data);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function createIconUploadUrl(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { userId } = req as AuthenticatedRequest;
    const parsed = iconUploadUrlSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        error: parsed.error.issues[0]?.message ?? "Invalid request body",
        statusCode: 400,
        code: ErrorCodes.VALIDATION,
      });
      return;
    }

    const upload = await createOrganizationIconUploadUrl(
      userId,
      parsed.data.contentType,
      parsed.data.extension,
    );
    res.status(201).json({ data: upload });
  } catch (err) {
    next(err);
  }
}
