import { createLogger } from "@orvex/logger";

const logger = createLogger({ name: "email:auth" });

export type AuthEmailActionType =
  | "signup"
  | "recovery"
  | "invite"
  | "magiclink"
  | "email_change"
  | "email_change_new"
  | "reauthentication";

export interface AuthHookEmailData {
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: AuthEmailActionType;
  site_url: string;
  token_new?: string;
  token_hash_new?: string;
}

export interface AuthHookUser {
  email: string;
  new_email?: string;
}

const subjects: Record<AuthEmailActionType, string> = {
  signup: "Confirm your Orvex email",
  recovery: "Reset your Orvex password",
  invite: "You are invited to Orvex",
  magiclink: "Your Orvex sign-in link",
  email_change: "Confirm your Orvex email change",
  email_change_new: "Confirm your new Orvex email",
  reauthentication: "Your Orvex verification code",
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export function buildSupabaseVerifyUrl(
  supabaseUrl: string,
  emailData: Pick<AuthHookEmailData, "token_hash" | "email_action_type" | "redirect_to">,
): string {
  const url = new URL("/auth/v1/verify", supabaseUrl);
  url.searchParams.set("token", emailData.token_hash);
  url.searchParams.set("type", emailData.email_action_type);
  url.searchParams.set("redirect_to", emailData.redirect_to);
  return url.toString();
}

function renderAuthEmailHtml(
  action: AuthEmailActionType,
  confirmationUrl: string,
  otp: string,
): string {
  const safeUrl = escapeHtml(confirmationUrl);
  const safeOtp = escapeHtml(otp);

  const intro: Record<AuthEmailActionType, string> = {
    signup: "Confirm your email address to finish creating your Orvex account.",
    recovery: "Reset your password using the button below.",
    invite: "You have been invited to Orvex. Accept the invitation to continue.",
    magiclink: "Sign in to Orvex using the button below. This link expires soon.",
    email_change: "Confirm your email change request.",
    email_change_new: "Confirm this address as your new Orvex email.",
    reauthentication: "Use this verification code to continue:",
  };

  const body =
    action === "reauthentication"
      ? `<p style="font-size: 28px; font-weight: 700; letter-spacing: 0.2em; color: #f8fafc; margin: 16px 0;">${safeOtp}</p>`
      : `<a href="${safeUrl}" style="display: inline-block; margin: 20px 0; background: #22d3ee; color: #0f172a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Continue</a>
         <p style="color: #64748b; font-size: 12px; word-break: break-all;">Or copy this link:<br /><a href="${safeUrl}" style="color: #94a3b8;">${safeUrl}</a></p>`;

  return `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; color: #e2e8f0; background: #0f172a; padding: 32px; border-radius: 12px;">
      <h1 style="color: #f8fafc; font-size: 20px; margin: 0 0 12px;">${escapeHtml(subjects[action])}</h1>
      <p style="color: #94a3b8; line-height: 1.6; margin: 0 0 8px;">${intro[action]}</p>
      ${body}
      <p style="color: #64748b; font-size: 12px; margin: 24px 0 0;">If you did not request this, you can ignore this email.</p>
    </div>
  `;
}

export async function sendAuthHookEmail(
  send: (to: string, subject: string, html: string) => Promise<boolean>,
  input: {
    to: string;
    supabaseUrl: string;
    user: AuthHookUser;
    emailData: AuthHookEmailData;
  },
): Promise<void> {
  const { emailData, supabaseUrl, to } = input;
  const action = emailData.email_action_type;

  const confirmationUrl = buildSupabaseVerifyUrl(supabaseUrl, emailData);
  const html = renderAuthEmailHtml(action, confirmationUrl, emailData.token);
  const subject = subjects[action];

  logger.info("[mail-debug] Preparing auth hook email", {
    to,
    action,
    subject,
    redirectTo: emailData.redirect_to,
    siteUrl: emailData.site_url,
    tokenHashPrefix: `${emailData.token_hash.slice(0, 8)}…`,
    confirmationUrlHost: new URL(confirmationUrl).host,
  });

  const ok = await send(to, subject, html);
  if (!ok) {
    logger.error("[mail-debug] Auth hook email delivery failed", { to, action, subject });
    throw new Error("Resend rejected auth email — check RESEND_API_KEY, EMAIL_FROM domain, and Resend dashboard logs");
  }

  logger.info("[mail-debug] Auth hook email sent successfully", { to, action, subject });
}
