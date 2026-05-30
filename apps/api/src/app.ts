import cors from "cors";
import express from "express";
import helmet from "helmet";
import passport from "passport";

import { createHttpLogger, createLogger } from "@orvex/logger";

import { configurePassport } from "./config/passport";
import { getEnv, loadEnv } from "./config/env";
import { createSessionMiddleware } from "./config/session";
import { createGlobalRateLimiter } from "./config/rate-limit";
import { csrfProtection } from "./middlewares/csrf.middleware";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { apiRouter } from "./routes";

export function createApp() {
  loadEnv();
  const env = getEnv();
  const logger = createLogger({ name: "api" });

  configurePassport();

  const app = express();

  if (env.TRUST_PROXY) {
    app.set("trust proxy", 1);
  }

  app.use(helmet());
  app.use(
    cors({
      origin: env.WEB_ORIGIN,
      credentials: true,
      allowedHeaders: ["Authorization", "Content-Type", "X-XSRF-TOKEN"],
      exposedHeaders: ["X-XSRF-TOKEN"],
    }),
  );

  app.use(express.json({ limit: "1mb" }));
  app.use(createHttpLogger(logger));
  app.use(createSessionMiddleware());
  app.use(passport.initialize());
  app.use(csrfProtection);
  app.use(createGlobalRateLimiter());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/v1", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
