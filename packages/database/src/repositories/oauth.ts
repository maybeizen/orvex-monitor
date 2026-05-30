import type { UserOAuthProvider } from "@orvex/types";
import { and, eq } from "drizzle-orm";

import { createDb } from "../client";
import { userOauthAccounts } from "../schema";
import type { OAuthAccountRow } from "../table-types";

export type { OAuthAccountRow };

export const oauthRepository = {
  async listByUserId(userId: string): Promise<OAuthAccountRow[]> {
    const db = createDb();
    return db.select().from(userOauthAccounts).where(eq(userOauthAccounts.user_id, userId));
  },

  async upsert(
    userId: string,
    provider: UserOAuthProvider,
    providerId: string,
  ): Promise<void> {
    const db = createDb();
    const [existing] = await db
      .select({ id: userOauthAccounts.id })
      .from(userOauthAccounts)
      .where(
        and(
          eq(userOauthAccounts.user_id, userId),
          eq(userOauthAccounts.provider, provider),
        ),
      )
      .limit(1);

    if (existing) {
      await db
        .update(userOauthAccounts)
        .set({ provider_id: providerId })
        .where(
          and(
            eq(userOauthAccounts.user_id, userId),
            eq(userOauthAccounts.provider, provider),
          ),
        );
      return;
    }

    await db.insert(userOauthAccounts).values({
      user_id: userId,
      provider,
      provider_id: providerId,
    });
  },

  async remove(userId: string, provider: UserOAuthProvider): Promise<void> {
    const db = createDb();
    await db
      .delete(userOauthAccounts)
      .where(
        and(
          eq(userOauthAccounts.user_id, userId),
          eq(userOauthAccounts.provider, provider),
        ),
      );
  },

  async removeAllForUser(userId: string): Promise<void> {
    const db = createDb();
    await db.delete(userOauthAccounts).where(eq(userOauthAccounts.user_id, userId));
  },

  async findByProviderAndProviderId(
    provider: UserOAuthProvider,
    providerId: string,
  ): Promise<OAuthAccountRow | null> {
    const db = createDb();
    const [row] = await db
      .select()
      .from(userOauthAccounts)
      .where(
        and(
          eq(userOauthAccounts.provider, provider),
          eq(userOauthAccounts.provider_id, providerId),
        ),
      )
      .limit(1);
    return row ?? null;
  },
};
