import { createClient } from "@supabase/supabase-js";

import type { Database } from "./types";

export function createSupabaseClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_ANON_KEY"];
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY");
  return createClient<Database>(url, key);
}

export function createSupabaseServiceClient() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  if (!url || !key) throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
  });
}

export type SupabaseClient = ReturnType<typeof createSupabaseClient>;
export type SupabaseServiceClient = ReturnType<typeof createSupabaseServiceClient>;
