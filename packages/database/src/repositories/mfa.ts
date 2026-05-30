import type { Json } from "../types";
import { createSupabaseServiceClient } from "../client";

export interface MfaRow {
  id: string;
  user_id: string;
  enabled: boolean;
  secret: string | null;
  backup_codes: Json;
  created_at: string;
  updated_at: string;
}

export const mfaRepository = {
  async findByUserId(userId: string): Promise<MfaRow | null> {
    const client = createSupabaseServiceClient();
    const { data, error } = await client
      .from("user_mfa")
      .select("id, user_id, enabled, secret, backup_codes, created_at, updated_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;
    return data as MfaRow | null;
  },

  async upsertPending(userId: string, encryptedSecret: string): Promise<MfaRow> {
    const client = createSupabaseServiceClient();
    const existing = await this.findByUserId(userId);

    if (existing) {
      const { data, error } = await client
        .from("user_mfa")
        .update({
          secret: encryptedSecret,
          enabled: false,
          backup_codes: [],
        })
        .eq("user_id", userId)
        .select("id, user_id, enabled, secret, backup_codes, created_at, updated_at")
        .single();
      if (error) throw error;
      return data as MfaRow;
    }

    const { data, error } = await client
      .from("user_mfa")
      .insert({
        user_id: userId,
        secret: encryptedSecret,
        enabled: false,
        backup_codes: [],
      })
      .select("id, user_id, enabled, secret, backup_codes, created_at, updated_at")
      .single();

    if (error) throw error;
    return data as MfaRow;
  },

  async enable(
    userId: string,
    encryptedSecret: string,
    backupCodeHashes: Json,
  ): Promise<void> {
    const client = createSupabaseServiceClient();
    const { error } = await client.from("user_mfa").upsert(
      {
        user_id: userId,
        secret: encryptedSecret,
        enabled: true,
        backup_codes: backupCodeHashes,
      },
      { onConflict: "user_id" },
    );

    if (error) throw error;
  },

  async disable(userId: string): Promise<void> {
    const client = createSupabaseServiceClient();
    const { error } = await client
      .from("user_mfa")
      .update({
        enabled: false,
        secret: null,
        backup_codes: [],
      })
      .eq("user_id", userId);

    if (error) throw error;
  },

  async updateBackupCodes(userId: string, backupCodeHashes: Json): Promise<void> {
    const client = createSupabaseServiceClient();
    const { error } = await client
      .from("user_mfa")
      .update({ backup_codes: backupCodeHashes })
      .eq("user_id", userId);

    if (error) throw error;
  },
};
