import rateLimit from "express-rate-limit";

import { ErrorCodes } from "../constants/http";

export function createGlobalRateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests", statusCode: 429, code: ErrorCodes.RATE_LIMIT },
  });
}

export function createAuthRateLimiter() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 150,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many auth attempts", statusCode: 429, code: ErrorCodes.RATE_LIMIT },
  });
}