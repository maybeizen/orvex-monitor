import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  LOG_LEVEL: z.string().default("info"),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
  SESSION_SECRET: z.string().min(32),
  SESSION_COOKIE_NAME: z.string().min(1).default("orvex.sid"),
  SESSION_MAX_AGE_MS: z.coerce.number().int().positive().default(60 * 60 * 24 * 7 * 1000),
  TRUST_PROXY: z
    .enum(["true", "false"])
    .default("false")
    .transform((v) => v === "true"),
  RESEND_API_KEY: z.string().min(1).optional(),
  EMAIL_FROM: z.string().default("Orvex <onboarding@resend.dev>"),
  /** From Supabase Auth → Hooks → Send Email → Generate secret (v1,whsec_...) */
  SEND_EMAIL_HOOK_SECRET: z.string().min(1).optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | undefined;

export function loadEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid environment configuration: ${message}`);
  }
  cached = parsed.data;
  return cached;
}

export function getEnv(): Env {
  if (!cached) throw new Error("Environment not loaded — call loadEnv() first");
  return cached;
}
