import type { NextFunction, Request, Response } from "express";

import { createLogger } from "@orvex/logger";

import { ErrorCodes } from "../constants/http";
import { AppError } from "../utils/AppError";

const logger = createLogger({ name: "api:error" });

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Not found", statusCode: 404, code: ErrorCodes.NOT_FOUND });
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
      code: err.code,
    });
    return;
  }

  logger.error("Unhandled error", { err });
  res.status(500).json({
    error: "Internal server error",
    statusCode: 500,
    code: ErrorCodes.INTERNAL,
  });
}
