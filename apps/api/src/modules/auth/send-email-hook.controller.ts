import type { Request, Response } from "express";
import { Webhook } from "standardwebhooks";
import { z } from "zod";

import { sendAuthHookEmailViaResend } from "@orvex/email";
import { createLogger } from "@orvex/logger";

import { getEnv } from "../../config/env";

const logger = createLogger({ name: "api:send-email-hook" });

const emailDataSchema = z.object({
  token: z.string(),
  token_hash: z.string(),
  redirect_to: z.string(),
  email_action_type: z.enum([
    "signup",
    "recovery",
    "invite",
    "magiclink",
    "email_change",
    "email_change_new",
    "reauthentication",
  ]),
  site_url: z.string(),
  token_new: z.string().optional(),
  token_hash_new: z.string().optional(),
});

const hookPayloadSchema = z.object({
  user: z.object({
    email: z.string().email(),
    new_email: z.string().email().optional(),
  }),
  email_data: emailDataSchema,
});

function readRawBody(req: Request): string {
  if (typeof req.body === "string") return req.body;
  if (Buffer.isBuffer(req.body)) return req.body.toString("utf8");
  return JSON.stringify(req.body);
}

function webhookHeaders(req: Request): Record<string, string> {
  const id = req.get("webhook-id");
  const timestamp = req.get("webhook-timestamp");
  const signature = req.get("webhook-signature");
  if (!id || !timestamp || !signature) {
    throw new Error("Missing Standard Webhooks headers");
  }
  return {
    "webhook-id": id,
    "webhook-timestamp": timestamp,
    "webhook-signature": signature,
  };
}

export async function handleSendEmailHook(req: Request, res: Response): Promise<void> {
  const env = getEnv();
  const secret = env.SEND_EMAIL_HOOK_SECRET;

  logger.info("[mail-debug] Send Email hook request received", {
    method: req.method,
    path: req.path,
    contentType: req.get("content-type"),
    bodyType: typeof req.body,
    bodyBytes: Buffer.isBuffer(req.body)
      ? req.body.length
      : typeof req.body === "string"
        ? req.body.length
        : undefined,
    webhookIdPresent: Boolean(req.get("webhook-id")),
    webhookTimestampPresent: Boolean(req.get("webhook-timestamp")),
    webhookSignaturePresent: Boolean(req.get("webhook-signature")),
    sendEmailHookSecretConfigured: Boolean(secret),
    resendApiKeyConfigured: Boolean(env.RESEND_API_KEY),
    emailFrom: env.EMAIL_FROM,
  });

  if (!secret) {
    logger.error("[mail-debug] SEND_EMAIL_HOOK_SECRET is not configured");
    res.status(503).json({
      error: {
        http_code: 503,
        message: "Send email hook secret not configured on API",
      },
    });
    return;
  }

  if (!env.RESEND_API_KEY) {
    logger.error("[mail-debug] RESEND_API_KEY is not configured");
    res.status(503).json({
      error: {
        http_code: 503,
        message: "RESEND_API_KEY not configured on API",
      },
    });
    return;
  }

  const rawBody = readRawBody(req);

  try {
    logger.debug("[mail-debug] Verifying Send Email hook signature", {
      rawBodyBytes: rawBody.length,
    });

    const wh = new Webhook(secret);
    const verified = wh.verify(rawBody, webhookHeaders(req)) as unknown;
    const parsed = hookPayloadSchema.parse(verified);

    const recipient =
      parsed.email_data.email_action_type === "email_change_new" &&
      parsed.user.new_email
        ? parsed.user.new_email
        : parsed.user.email;

    logger.info("[mail-debug] Send Email hook payload verified", {
      action: parsed.email_data.email_action_type,
      recipient,
      userEmail: parsed.user.email,
      newEmail: parsed.user.new_email,
      redirectTo: parsed.email_data.redirect_to,
      siteUrl: parsed.email_data.site_url,
      tokenHashPrefix: `${parsed.email_data.token_hash.slice(0, 8)}…`,
    });

    const user: { email: string; new_email?: string } = { email: parsed.user.email };
    if (parsed.user.new_email) user.new_email = parsed.user.new_email;

    const emailData = {
      token: parsed.email_data.token,
      token_hash: parsed.email_data.token_hash,
      redirect_to: parsed.email_data.redirect_to,
      email_action_type: parsed.email_data.email_action_type,
      site_url: parsed.email_data.site_url,
      ...(parsed.email_data.token_new ? { token_new: parsed.email_data.token_new } : {}),
      ...(parsed.email_data.token_hash_new
        ? { token_hash_new: parsed.email_data.token_hash_new }
        : {}),
    };

    await sendAuthHookEmailViaResend({
      to: recipient,
      supabaseUrl: env.SUPABASE_URL,
      user,
      emailData,
    });

    logger.info("[mail-debug] Send Email hook completed successfully", {
      action: parsed.email_data.email_action_type,
      recipient,
    });

    res.status(200).json({});
  } catch (err) {
    logger.error("[mail-debug] Send Email hook failed", {
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      errorName: err instanceof Error ? err.name : undefined,
    });
    res.status(401).json({
      error: {
        http_code: 401,
        message: err instanceof Error ? err.message : "Send email hook failed",
      },
    });
  }
}
