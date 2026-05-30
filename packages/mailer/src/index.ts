import { createLogger } from "@orvex/logger";

import { renderTemplate } from "./render";
import {
  createMailerTransport,
  getMailerTransport,
  setMailerTransport,
  type MailerTransportConfig,
} from "./transport";

const logger = createLogger({ name: "mailer" });

export interface MailerConfig extends MailerTransportConfig {
  from: string;
  webOrigin: string;
}

let config: MailerConfig | undefined;

function maskEmail(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return "***";
  const visible = local.length <= 2 ? "*" : `${local.slice(0, 2)}***`;
  return `${visible}@${domain}`;
}

export function configureMailer(next: MailerConfig): void {
  config = next;
  setMailerTransport(createMailerTransport(next));
  logger.info("Mailer configured", {
    from: next.from,
    webOrigin: next.webOrigin,
    host: next.host,
    port: next.port,
  });
}

function getConfig(): MailerConfig {
  if (!config) {
    throw new Error("Mailer not configured — call configureMailer() at startup");
  }
  return config;
}

async function sendEmail(
  to: string,
  subject: string,
  html: string,
): Promise<boolean> {
  const { from } = getConfig();
  try {
    await getMailerTransport().sendMail({ from, to, subject, html });
    logger.info("Email sent", { to: maskEmail(to), subject });
    return true;
  } catch (err) {
    logger.error("Email delivery failed", {
      to: maskEmail(to),
      subject,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
}

export interface SignupVerificationEmailInput {
  email: string;
  token: string;
}

export async function sendSignupVerificationEmail(
  input: SignupVerificationEmailInput,
): Promise<boolean> {
  const { webOrigin } = getConfig();
  const verifyUrl = `${webOrigin}/auth/verify-email?token=${encodeURIComponent(input.token)}`;
  const html = await renderTemplate("signup-verification", { verifyUrl });
  return sendEmail(input.email, "Confirm your Orvex email", html);
}

export interface PasswordResetEmailInput {
  email: string;
  token: string;
}

export async function sendPasswordResetEmail(
  input: PasswordResetEmailInput,
): Promise<boolean> {
  const { webOrigin } = getConfig();
  const resetUrl = `${webOrigin}/auth/reset-password?token=${encodeURIComponent(input.token)}`;
  const html = await renderTemplate("password-reset", { resetUrl });
  return sendEmail(input.email, "Reset your Orvex password", html);
}

export type EmailChangeKind = "current" | "new";

export interface EmailChangeEmailInput {
  email: string;
  token: string;
  kind: EmailChangeKind;
}

export async function sendEmailChangeEmail(
  input: EmailChangeEmailInput,
): Promise<boolean> {
  const { webOrigin } = getConfig();
  const confirmUrl = `${webOrigin}/auth/confirm-email-change?token=${encodeURIComponent(input.token)}`;
  const template = input.kind === "new" ? "email-change-new" : "email-change";
  const subject =
    input.kind === "new"
      ? "Confirm your new Orvex email"
      : "Confirm your Orvex email change";
  const html = await renderTemplate(template, { confirmUrl });
  return sendEmail(input.email, subject, html);
}

export interface AccountDeactivationEmailInput {
  email: string;
  scheduledAt: Date;
}

export async function sendAccountDeactivationEmail(
  input: AccountDeactivationEmailInput,
): Promise<boolean> {
  const { webOrigin } = getConfig();
  const reactivateUrl = `${webOrigin}/app/account/danger`;
  const scheduledDate = input.scheduledAt.toLocaleDateString("en-US", {
    dateStyle: "long",
  });
  const html = await renderTemplate("account-deactivation", {
    reactivateUrl,
    scheduledDate,
  });
  return sendEmail(
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
  const html = await renderTemplate("account-purged", {});
  return sendEmail(input.email, "Your Orvex account has been deleted", html);
}
