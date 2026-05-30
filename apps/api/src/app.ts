import cors from "cors";
import express from "express";
import helmet from "helmet";

import { createHttpLogger, createLogger } from "@orvex/logger";

import { getEnv, loadEnv } from "./config/env";
import { createSessionMiddleware } from "./config/session";
import { createGlobalRateLimiter } from "./config/rate-limit";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";
import { sendEmailHookRouter } from "./modules/auth/send-email-hook.routes";
import { apiRouter } from "./routes";

export function createApp() {
  loadEnv();
  const env = getEnv();
  const logger = createLogger({ name: "api" });

  const app = express();

  if (env.TRUST_PROXY) {
    app.set("trust proxy", 1);
  }

  app.use(helmet());
  app.use(
    cors({
      origin: env.WEB_ORIGIN,
      credentials: true,
      allowedHeaders: ["Authorization", "Content-Type"],
    }),
  );
  // Supabase Send Email hook must read the raw body for signature verification.
  app.use("/api/v1/auth/hooks", sendEmailHookRouter);

  app.use(express.json({ limit: "1mb" }));
  app.use(createHttpLogger(logger));
  app.use(createSessionMiddleware());
  app.use(createGlobalRateLimiter());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api/v1", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
