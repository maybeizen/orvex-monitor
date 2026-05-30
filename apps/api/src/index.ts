import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadDotenv } from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: resolve(__dirname, "../../../.env") });
loadDotenv();

import { configureEmail } from "@orvex/email";
import { createLogger } from "@orvex/logger";

import { getEnv, loadEnv } from "./config/env";
import { createApp } from "./app";

loadEnv();
const env = getEnv();
configureEmail({
  resendApiKey: env.RESEND_API_KEY,
  from: env.EMAIL_FROM,
  webOrigin: env.WEB_ORIGIN,
});
const logger = createLogger({ name: "api:server" });
const port = getEnv().PORT;

const app = createApp();

app.listen(port, () => {
  logger.info("API server started", {
    port,
    mailDebug: {
      resendConfigured: Boolean(env.RESEND_API_KEY),
      sendEmailHookSecretConfigured: Boolean(env.SEND_EMAIL_HOOK_SECRET),
      emailFrom: env.EMAIL_FROM,
      webOrigin: env.WEB_ORIGIN,
    },
  });
});
