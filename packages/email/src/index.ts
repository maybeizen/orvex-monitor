import { createLogger } from "@orvex/logger";

import {
  sendAuthHookEmail,
  type AuthHookEmailData,
  type AuthHookUser,
} from "./auth-email";

const logger = createLogger({ name: "email" });

export interface EmailConfig {
  resendApiKey?: string | undefined;
  from: string;
  webOrigin: string;
}

let config: EmailConfig | undefined;

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  const visible = local.length <= 2 ? "*" : `${local.slice(0, 2)}***`;
  return `${visible}@${domain}`;
}

export function configureEmail(next: EmailConfig): void {
  config = next;
  logger.info("[mail-debug] Email package configured", {
    from: next.from,
    webOrigin: next.webOrigin,
    resendConfigured: Boolean(next.resendApiKey),
    resendKeyPrefix: next.resendApiKey ? `${next.resendApiKey.slice(0, 8)}…` : undefined,
  });
}

function getConfig(): EmailConfig {
  if (!config) {
    throw new Error("Email not configured — call configureEmail() at startup");
  }
  return config;
}

async function sendViaResend(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  const { resendApiKey, from } = getConfig();
  if (!resendApiKey) {
    logger.warn("[mail-debug] RESEND_API_KEY not set — skipping email", {
      to: maskEmail(to),
      subject,
    });
    return false;
  }

  logger.info("[mail-debug] Calling Resend API", {
    to: maskEmail(to),
    subject,
    from,
    htmlBytes: html.length,
  });

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  const body = await response.text();

  if (!response.ok) {
    logger.error("[mail-debug] Resend API rejected email", {
      status: response.status,
      body,
      to: maskEmail(to),
      subject,
      from,
    });
    return false;
  }

  let resendId: string | undefined;
  try {
    const parsed = JSON.parse(body) as { id?: string };
    resendId = parsed.id;
  } catch {
    // Non-JSON success bodies are unexpected but not fatal.
  }

  logger.info("[mail-debug] Resend accepted email", {
    status: response.status,
    resendId,
    to: maskEmail(to),
    subject,
  });

  return true;
}

export interface AccountDeactivationEmailInput {
  email: string;
  scheduledAt: Date;
}

export async function sendAccountDeactivationEmail(
  input: AccountDeactivationEmailInput,
): Promise<boolean> {
  logger.info("[mail-debug] Sending account deactivation email", {
    to: maskEmail(input.email),
    scheduledAt: input.scheduledAt.toISOString(),
  });
  const { webOrigin } = getConfig();
  const reactivateUrl = `${webOrigin}/app/account/danger`;
  const formattedDate = input.scheduledAt.toLocaleDateString("en-US", {
    dateStyle: "long",
  });

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; color: #e2e8f0; background: #0f172a; padding: 32px; border-radius: 12px;">
      <h1 style="color: #f8fafc; font-size: 20px; margin: 0 0 16px;">Account deactivation scheduled</h1>
      <p style="color: #94a3b8; line-height: 1.6; margin: 0 0 16px;">
        Your Orvex account has been scheduled for deletion on <strong style="color: #e2e8f0;">${formattedDate}</strong>.
        You have 30 days to reactivate before your data is permanently removed.
      </p>
      <a href="${reactivateUrl}" style="display: inline-block; background: #6366f1; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
        Reactivate account
      </a>
      <p style="color: #64748b; font-size: 12px; margin: 24px 0 0;">
        If you did not request this, reactivate immediately to restore access.
      </p>
    </div>
  `;

  return sendViaResend(
    input.email,
    "Your Orvex account is scheduled for deletion",
    html,
  );
}

export interface AccountPurgedEmailInput {
  email: string;
}

export async function sendAccountPurgedEmail(
  input: AccountPurgedEmailInput,
): Promise<boolean> {
  logger.info("[mail-debug] Sending account purged email", {
    to: maskEmail(input.email),
  });
  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; color: #e2e8f0; background: #0f172a; padding: 32px; border-radius: 12px;">
      <h1 style="color: #f8fafc; font-size: 20px; margin: 0 0 16px;">Account permanently deleted</h1>
      <p style="color: #94a3b8; line-height: 1.6; margin: 0;">
        Your Orvex account and associated data have been permanently removed from our systems.
      </p>
    </div>
  `;

  return sendViaResend(input.email, "Your Orvex account has been deleted", html);
}

export {
  buildSupabaseVerifyUrl,
  type AuthEmailActionType,
  type AuthHookEmailData,
  type AuthHookUser,
} from "./auth-email";

/** Used by Supabase Send Email hook — throws on failure so Auth surfaces delivery errors. */
export async function sendAuthHookEmailViaResend(input: {
  to: string;
  supabaseUrl: string;
  user: AuthHookUser;
  emailData: AuthHookEmailData;
}): Promise<void> {
  logger.info("[mail-debug] sendAuthHookEmailViaResend invoked", {
    to: maskEmail(input.to),
    action: input.emailData.email_action_type,
    supabaseHost: new URL(input.supabaseUrl).host,
  });
  return sendAuthHookEmail(
    async (to, subject, html) => sendViaResend(to, subject, html),
    input,
  );
}
