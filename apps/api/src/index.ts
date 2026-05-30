import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadDotenv } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: resolve(__dirname, "../../../.env") });
loadDotenv();

import { configureMailer } from "@orvex/mailer";
import { createLogger } from "@orvex/logger";
import { buildStorageConfigFromEnv, configureStorage } from "@orvex/storage";

import { getEnv, loadEnv } from "./config/env";
import { createApp } from "./app";

loadEnv();
const env = getEnv();

configureMailer({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  user: env.SMTP_USER ?? "",
  pass: env.SMTP_PASS ?? "",
  secure: env.SMTP_SECURE,
  from: env.EMAIL_FROM,
  webOrigin: env.WEB_ORIGIN,
});

configureStorage(buildStorageConfigFromEnv());

const logger = createLogger({ name: "api:server" });
const port = env.PORT;

const app = createApp();

app.listen(port, () => {
  logger.info("API server started", {
    port,
    mailConfigured: true,
    storageDriver: env.STORAGE_DRIVER,
    webOrigin: env.WEB_ORIGIN,
  });
});
