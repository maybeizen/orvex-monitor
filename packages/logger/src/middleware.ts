import expressWinston from "express-winston";

import type { Logger } from "./logger";

export function createHttpLogger(logger: Logger) {
  return expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    msg: "{{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
    expressFormat: false,
    colorize: false,
    ignoreRoute: (req) => req.url === "/health",
  });
}
