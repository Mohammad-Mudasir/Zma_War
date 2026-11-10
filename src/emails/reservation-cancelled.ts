import { escapeHtml } from "@/lib/utils";
import { emailLayout, type EmailContent } from "./layout";

export function reservationCancelledEmail(input: {
  name: string;
  dayLong: string;
  start: string;
  end: string;
  bookUrl: string;
  hospital: string;
}): EmailContent {
  const when = `${input.dayLong}, ${input.start} – ${input.end}`;
  const html = emailLayout({
    preview: "Your reservation was cancelled. Choose another time.",
    heading: "Your reservation was cancelled",
    bodyHtml: `<p style="margin:0 0 12px">Hi ${escapeHtml(input.name)}, the administrator at ${escapeHtml(input.hospital)} had to cancel this reservation:</p>
<p style="margin:0 0 12px;padding:14px 16px;background:#fbebed;border-radius:12px;font-weight:bold">${escapeHtml(when)}</p>
<p style="margin:0">We're sorry for the trouble. Please choose another available time.</p>`,
    button: { label: "Choose another time", url: input.bookUrl },
  });

  const text = `Hi ${input.name},

The administrator at ${input.hospital} had to cancel this reservation:
${when}

We're sorry for the trouble. Please choose another available time:
${input.bookUrl}`;

  return { subject: "Your reservation was cancelled", html, text };
}
