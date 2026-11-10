import { escapeHtml } from "@/lib/utils";
import { reminderLabel } from "@/lib/constants";
import { emailLayout, type EmailContent } from "./layout";

export function appointmentReminderEmail(input: {
  name: string;
  dayLong: string;
  start: string;
  end: string;
  leadMinutes: number;
  manageUrl: string;
  hospital: string;
}): EmailContent {
  const when = `${input.dayLong}, ${input.start} – ${input.end}`;
  const html = emailLayout({
    preview: `Your appointment is on ${input.dayLong} at ${input.start}.`,
    heading: "It's almost your turn",
    bodyHtml: `<p style="margin:0 0 12px">Hi ${escapeHtml(input.name)}, this is your reminder (${escapeHtml(reminderLabel(input.leadMinutes))} before) for your appointment at ${escapeHtml(input.hospital)}.</p>
<p style="margin:0 0 12px;padding:14px 16px;background:#e8f3ef;border-radius:12px;font-weight:bold">${escapeHtml(when)}</p>
<p style="margin:0;color:#5a6b65">Can't make it? Please cancel so someone else can have the slot.</p>`,
    button: { label: "View my reservations", url: input.manageUrl },
  });

  const text = `Hi ${input.name},

Reminder (${reminderLabel(input.leadMinutes)} before): your appointment at ${input.hospital} is
${when}

Can't make it? Please cancel so someone else can have the slot:
${input.manageUrl}`;

  return { subject: `Reminder: your appointment at ${input.start}`, html, text };
}
