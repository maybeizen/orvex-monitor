import process from "node:process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadDotenv } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: resolve(__dirname, "../../../.env") });
loadDotenv();

import { configureMailer } from "@orvex/mailer";
import { createLogger } from "@orvex/logger";

import { startScheduler } from "./scheduler";

const logger = createLogger({ name: "worker" });

const smtpHost = process.env["SMTP_HOST"];
const smtpPort = Number(process.env["SMTP_PORT"] ?? "587");
const smtpUser = process.env["SMTP_USER"];
const smtpPass = process.env["SMTP_PASS"];
const smtpSecure = process.env["SMTP_SECURE"] === "true";
const emailFrom = process.env["EMAIL_FROM"] ?? "Orvex <noreply@orvex.app>";
const webOrigin = process.env["WEB_ORIGIN"] ?? "http://localhost:5173";

if (smtpHost) {
  configureMailer({
    host: smtpHost,
    port: smtpPort,
    user: smtpUser ?? "",
    pass: smtpPass ?? "",
    secure: smtpSecure,
    from: emailFrom,
    webOrigin,
  });
}

startScheduler();
logger.info("Worker started");
