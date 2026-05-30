import "dotenv/config";

import { configureEmail } from "@orvex/email";
import { createLogger } from "@orvex/logger";

import { startScheduler } from "./scheduler";

const logger = createLogger({ name: "worker" });

const resendApiKey = process.env["RESEND_API_KEY"];
const emailFrom = process.env["EMAIL_FROM"] ?? "Orvex <noreply@orvex.app>";
const webOrigin = process.env["WEB_ORIGIN"] ?? "http://localhost:5173";

configureEmail({
  resendApiKey,
  from: emailFrom,
  webOrigin,
});

startScheduler();
logger.info("Worker started");

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, stopping scheduler");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, stopping scheduler");
  process.exit(0);
});
