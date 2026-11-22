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

/** "Zma Wār <me@example.com>" -> { name, email } */
function parseFrom(value: string): { name?: string; email: string } {
  const match = value.match(/^\s*(?:"?([^"<]*?)"?\s*)?<([^>]+)>\s*$/);
  if (match) return { name: match[1]?.trim() || undefined, email: match[2]!.trim() };
  return { email: value.trim() };
}

/**
 * Sends through Brevo's HTTPS API (port 443). Use this on hosts that block
 * outbound SMTP ports, such as Render's free plan.
 */
async function sendWithBrevo(mail: Mail, apiKey: string): Promise<SendResult> {
  const sender = parseFrom(process.env.EMAIL_FROM ?? "");
  if (!sender.email) return { ok: false, error: "EMAIL_FROM must be set when using BREVO_API_KEY." };

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        sender,
        to: [{ email: mail.to }],
        subject: mail.subject,
        htmlContent: mail.html,
        textContent: mail.text,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      const body = (await res.text()).slice(0, 200);
      console.error(`[email] Brevo rejected "${mail.subject}" (${res.status}): ${body}`);
      return { ok: false, error: `Brevo ${res.status}: ${body}`.slice(0, 250) };
    }
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown email error";
    console.error(`[email] Failed to send "${mail.subject}" via Brevo:`, message);
    return { ok: false, error: message.slice(0, 250) };
  }
}

/**
 * Sends one email. Never throws: callers decide what a failure means,
 * so an email problem can't corrupt a reservation (SDD 2.2).
 *
 * Order of preference: Brevo API (BREVO_API_KEY) -> SMTP (SMTP_HOST) -> console in development.
 */
export async function sendEmail(mail: Mail): Promise<SendResult> {
  const brevoKey = process.env.BREVO_API_KEY;
  if (brevoKey) return sendWithBrevo(mail, brevoKey);

  const transport = getTransport();

  if (!transport) {
    if (isProduction) {
      console.error("[email] Neither BREVO_API_KEY nor SMTP_HOST is configured; email not sent.");
      return { ok: false, error: "Email is not configured." };
    }
    // Development convenience: print the message instead of sending it.
    console.log(`\n[email:dev] To: ${mail.to}\n[email:dev] Subject: ${mail.subject}\n${mail.text}\n`);
    return { ok: true };
  }

  try {
    await transport.sendMail({
      from: process.env.EMAIL_FROM || "Zma Wār <no-reply@zmawar.local>",
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
