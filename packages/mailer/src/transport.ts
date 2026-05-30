import { createTransport, type Transporter } from "nodemailer";

export interface MailerTransportConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  secure?: boolean | undefined;
}

let transporter: Transporter | undefined;

export function createMailerTransport(config: MailerTransportConfig): Transporter {
  return createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure ?? config.port === 465,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

export function setMailerTransport(next: Transporter): void {
  transporter = next;
}

export function getMailerTransport(): Transporter {
  if (!transporter) {
    throw new Error("Mailer not configured — call configureMailer() at startup");
  }
  return transporter;
}
