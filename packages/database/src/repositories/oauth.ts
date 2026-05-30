import type { UserOAuthProvider } from "@orvex/types";

import { createSupabaseServiceClient } from "../client";

export interface OAuthAccountRow {
  id: string;
  user_id: string;
  provider: UserOAuthProvider;
  provider_id: string;
  created_at: string;
}

export const oauthRepository = {
  async listByUserId(userId: string): Promise<OAuthAccountRow[]> {
    const client = createSupabaseServiceClient();
    const { data, error } = await client
      .from("user_oauth_accounts")
      .select("id, user_id, provider, provider_id, created_at")
      .eq("user_id", userId);

    if (error) throw error;
    return (data ?? []) as OAuthAccountRow[];
  },

  async upsert(
    userId: string,
    provider: UserOAuthProvider,
    providerId: string,
  ): Promise<void> {
    const client = createSupabaseServiceClient();
    const existing = await client
      .from("user_oauth_accounts")
      .select("id")
      .eq("user_id", userId)
      .eq("provider", provider)
      .maybeSingle();

    if (existing.error) throw existing.error;

    if (existing.data) {
      const { error } = await client
        .from("user_oauth_accounts")
        .update({ provider_id: providerId })
        .eq("user_id", userId)
        .eq("provider", provider);
      if (error) throw error;
      return;
    }

    const { error } = await client.from("user_oauth_accounts").insert({
      user_id: userId,
      provider,
      provider_id: providerId,
    });

    if (error) throw error;
  },

  async remove(userId: string, provider: UserOAuthProvider): Promise<void> {
    const client = createSupabaseServiceClient();
    const { error } = await client
      .from("user_oauth_accounts")
      .delete()
      .eq("user_id", userId)
      .eq("provider", provider);

    if (error) throw error;
  },

  async removeAllForUser(userId: string): Promise<void> {
    const client = createSupabaseServiceClient();
    const { error } = await client.from("user_oauth_accounts").delete().eq("user_id", userId);

    if (error) throw error;
  },
};
