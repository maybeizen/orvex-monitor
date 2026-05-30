import { createSupabaseServiceClient, oauthRepository, usersRepository } from "@orvex/database";
import { sendAccountPurgedEmail } from "@orvex/email";
import { createLogger } from "@orvex/logger";

const logger = createLogger({ name: "worker:account-purge" });

export async function runAccountPurgeJob(): Promise<void> {
  const due = await usersRepository.findPendingDeletionDue();
  if (due.length === 0) {
    logger.info("No accounts due for purge");
    return;
  }

  const service = createSupabaseServiceClient();

  for (const profile of due) {
    try {
      await sendAccountPurgedEmail({ email: profile.email });
      const { error: authError } = await service.auth.admin.deleteUser(profile.id);
      if (authError) {
        logger.error("Failed to delete auth user", {
          userId: profile.id,
          error: authError.message,
        });
        continue;
      }

      await oauthRepository.removeAllForUser(profile.id);
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
