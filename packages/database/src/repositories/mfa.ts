import { eq } from "drizzle-orm";

import { createDb } from "../client";
import { userMfa } from "../schema";
import type { Json } from "../types";
import type { MfaRow } from "../table-types";

export type { MfaRow };

export const mfaRepository = {
  async findByUserId(userId: string): Promise<MfaRow | null> {
    const db = createDb();
    const [row] = await db
      .select()
      .from(userMfa)
      .where(eq(userMfa.user_id, userId))
      .limit(1);
    return row ?? null;
  },

  async upsertPending(userId: string, encryptedSecret: string): Promise<MfaRow> {
    const db = createDb();
    const [row] = await db
      .insert(userMfa)
      .values({
        user_id: userId,
        secret: encryptedSecret,
        enabled: false,
        backup_codes: [],
      })
      .onConflictDoUpdate({
        target: userMfa.user_id,
        set: {
          secret: encryptedSecret,
          enabled: false,
          backup_codes: [],
          updated_at: new Date().toISOString(),
        },
      })
      .returning();

    if (!row) throw new Error("Failed to upsert MFA");
    return row;
  },

  async enable(
    userId: string,
    encryptedSecret: string,
    backupCodeHashes: Json,
  ): Promise<void> {
    const db = createDb();
    await db
      .insert(userMfa)
      .values({
        user_id: userId,
        secret: encryptedSecret,
        enabled: true,
        backup_codes: backupCodeHashes,
      })
      .onConflictDoUpdate({
        target: userMfa.user_id,
        set: {
          secret: encryptedSecret,
          enabled: true,
          backup_codes: backupCodeHashes,
          updated_at: new Date().toISOString(),
        },
      });
  },

  async disable(userId: string): Promise<void> {
    const db = createDb();
    await db
      .update(userMfa)
      .set({
        enabled: false,
        secret: null,
        backup_codes: [],
        updated_at: new Date().toISOString(),
      })
      .where(eq(userMfa.user_id, userId));
  },

  async updateBackupCodes(userId: string, backupCodeHashes: Json): Promise<void> {
    const db = createDb();
    await db
      .update(userMfa)
      .set({
        backup_codes: backupCodeHashes,
        updated_at: new Date().toISOString(),
      })
      .where(eq(userMfa.user_id, userId));
  },

  async deleteForUser(userId: string): Promise<void> {
    const db = createDb();
    await db.delete(userMfa).where(eq(userMfa.user_id, userId));
  },
};
