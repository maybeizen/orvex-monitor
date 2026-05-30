import cron from "node-cron";

import { createLogger } from "@orvex/logger";

import { runAccountPurgeJob } from "./jobs/account-purge";

const logger = createLogger({ name: "worker:scheduler" });

export function startScheduler(): void {
  cron.schedule("0 3 * * *", () => {
    void runAccountPurgeJob().catch((err) => {
      logger.error("account-purge job failed", {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  });

  logger.info("Scheduler started", { jobs: ["account-purge (daily 03:00)"] });
}
