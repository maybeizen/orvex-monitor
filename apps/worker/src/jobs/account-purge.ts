import { mfaRepository, oauthRepository, usersRepository } from "@orvex/database";
import { sendAccountPurgedEmail } from "@orvex/mailer";
import { createLogger } from "@orvex/logger";

const logger = createLogger({ name: "worker:account-purge" });

export async function runAccountPurgeJob(): Promise<void> {
  const due = await usersRepository.findPendingDeletionDue();
  if (due.length === 0) {
    logger.info("No accounts due for purge");
    return;
  }

  for (const profile of due) {
    try {
      await sendAccountPurgedEmail({ email: profile.email });
      await oauthRepository.removeAllForUser(profile.id);
      await mfaRepository.deleteForUser(profile.id);
      await usersRepository.markDeleted(profile.id);
      logger.info("Purged account", { userId: profile.id });
    } catch (err) {
      logger.error("Account purge failed", {
        userId: profile.id,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  logger.info("Account purge job finished", { processed: due.length });
}
