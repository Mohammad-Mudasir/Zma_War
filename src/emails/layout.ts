import { escapeHtml } from "@/lib/utils";
import { APP_URL } from "@/lib/config";

export type EmailContent = { subject: string; html: string; text: string };

/** A plain, email-client-friendly wrapper (inline styles, no external assets). */
export function emailLayout(opts: {
  preview: string;
  heading: string;
  bodyHtml: string;
  button?: { label: string; url: string };
}): string {
  const button = opts.button
    ? `<p style="margin:28px 0 8px"><a href="${escapeHtml(opts.button.url)}" style="background:#0f6b58;color:#ffffff;padding:13px 26px;border-radius:999px;text-decoration:none;font-weight:bold;display:inline-block">${escapeHtml(opts.button.label)}</a></p>`
    : "";

  return `<!doctype html>
<html lang="en"><body style="margin:0;padding:0;background:#f4f6f3;font-family:Arial,Helvetica,sans-serif;color:#15241f">
<div style="display:none;max-height:0;overflow:hidden">${escapeHtml(opts.preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f3;padding:32px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
<tr><td style="padding:0 4px 16px;font-size:20px;font-weight:bold;color:#0b5646">Zma Wār</td></tr>
<tr><td style="background:#ffffff;border:1px solid #d8e0db;border-radius:18px;padding:32px">
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3">${escapeHtml(opts.heading)}</h1>
<div style="font-size:16px;line-height:1.6">${opts.bodyHtml}</div>${button}
</td></tr>
<tr><td style="padding:16px 4px;font-size:13px;color:#5a6b65">This message was sent by <a href="${escapeHtml(APP_URL)}" style="color:#5a6b65">Zma Wār</a>, a learning project for a fictional hospital.</td></tr>
</table></td></tr></table></body></html>`;
}
