import nodemailer, { type Transporter } from "nodemailer";
import { isProduction } from "./config";

type Mail = { to: string; subject: string; html: string; text: string };
export type SendResult = { ok: true } | { ok: false; error: string };

let transporter: Transporter | null = null;

function getTransport(): Transporter | null {
  if (!process.env.SMTP_HOST) return null;
  transporter ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });
  return transporter;
}

/**
 * Sends one email. Never throws: callers decide what a failure means,
 * so an email problem can't corrupt a reservation (SDD 2.2).
 */
export async function sendEmail(mail: Mail): Promise<SendResult> {
  const transport = getTransport();

  if (!transport) {
    if (isProduction) {
      console.error("[email] SMTP_HOST is not configured; email not sent.");
      return { ok: false, error: "Email is not configured." };
    }
    // Development convenience: print the message instead of sending it.
    console.log(`\n[email:dev] To: ${mail.to}\n[email:dev] Subject: ${mail.subject}\n${mail.text}\n`);
    return { ok: true };
  }

  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM ?? "Zma Wār <no-reply@zmawar.local>",
      to: mail.to,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error(`[email] Failed to send "${mail.subject}":`, message);
    return { ok: false, error: message.slice(0, 250) };
  }
}
