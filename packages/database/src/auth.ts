import type { SupabaseClient } from "./client";

export async function getSession(client: SupabaseClient) {
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getUser(client: SupabaseClient) {
  const { data, error } = await client.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function signOut(client: SupabaseClient) {
  const { error } = await client.auth.signOut();
  if (error) throw error;
}
