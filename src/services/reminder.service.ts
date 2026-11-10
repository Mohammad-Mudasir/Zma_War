import { prisma } from "@/lib/prisma";
import { APP_URL, HOSPITAL_NAME } from "@/lib/config";
import { sendEmail } from "@/lib/email";
import {
  DEFAULT_REMINDER_MINUTES,
  MAX_REMINDER_ATTEMPTS,
  MAX_REMINDER_MINUTES,
  isValidReminderMinutes,
} from "@/lib/constants";
import { formatDayLong, formatTime } from "@/lib/time";
import { appointmentReminderEmail } from "@/emails/appointment-reminder";
import { ServiceError } from "@/lib/errors";

const SETTING_KEY = "default_reminder_minutes";

// ---- Pure helpers (unit tested) ----

export function reminderDueAt(startTime: Date, leadMinutes: number): Date {
  return new Date(startTime.getTime() - leadMinutes * 60_000);
}

/** A reminder is due once its lead time has been reached and the appointment hasn't started. */
export function isReminderDue(startTime: Date, leadMinutes: number, now: Date): boolean {
  return reminderDueAt(startTime, leadMinutes) <= now && startTime > now;
}

// ---- Settings (FR-07: administrator configures the default lead time) ----

export async function getDefaultReminderMinutes(): Promise<number> {
  const row = await prisma.systemSetting.findUnique({ where: { key: SETTING_KEY } });
  const value = Number(row?.value);
  return isValidReminderMinutes(value) ? value : DEFAULT_REMINDER_MINUTES;
}

export async function setDefaultReminderMinutes(minutes: number): Promise<void> {
  if (!isValidReminderMinutes(minutes)) {
    throw new ServiceError("REMINDER_LOCKED", "Choose one of the listed reminder times.");
  }
  await prisma.systemSetting.upsert({
    where: { key: SETTING_KEY },
    update: { value: String(minutes) },
    create: { key: SETTING_KEY, value: String(minutes) },
  });
}

/** A user's own preference wins; otherwise the hospital default applies. */
export async function reminderDefaultFor(user: { defaultReminderMinutes: number | null } | null): Promise<number> {
  if (user?.defaultReminderMinutes && isValidReminderMinutes(user.defaultReminderMinutes)) {
    return user.defaultReminderMinutes;
  }
  return getDefaultReminderMinutes();
}

// ---- The worker's job (SDD 7.5) ----

/**
 * Sends every reminder that is due and hasn't been sent yet.
 * Cancelled reservations are never included. Each reservation is "claimed" by
 * bumping its attempt counter first, so two workers can't send the same email.
 */
export async function processDueReminders(now: Date = new Date()): Promise<{ sent: number; failed: number }> {
  const candidates = await prisma.reservation.findMany({
    where: {
      status: "ACTIVE",
      reminderSentAt: null,
      reminderAttempts: { lt: MAX_REMINDER_ATTEMPTS },
      appointment: { startTime: { gt: now, lte: new Date(now.getTime() + MAX_REMINDER_MINUTES * 60_000) } },
    },
    include: { appointment: true, user: { select: { name: true, email: true } } },
    orderBy: { appointment: { startTime: "asc" } },
    take: 100,
  });

  let sent = 0;
  let failed = 0;

  for (const r of candidates) {
    if (!isReminderDue(r.appointment.startTime, r.reminderLeadMinutes, now)) continue;

    const claim = await prisma.reservation.updateMany({
      where: { id: r.id, status: "ACTIVE", reminderSentAt: null, reminderAttempts: r.reminderAttempts },
      data: { reminderAttempts: { increment: 1 } },
    });
    if (claim.count !== 1) continue; // someone else got there first, or it was cancelled

    const mail = appointmentReminderEmail({
      name: r.user.name,
      dayLong: formatDayLong(r.appointment.startTime),
      start: formatTime(r.appointment.startTime),
      end: formatTime(r.appointment.endTime),
      leadMinutes: r.reminderLeadMinutes,
      manageUrl: `${APP_URL}/reservations`,
      hospital: HOSPITAL_NAME,
    });
    const result = await sendEmail({ to: r.user.email, ...mail });

    if (result.ok) {
      await prisma.reservation.update({ where: { id: r.id }, data: { reminderSentAt: new Date(), reminderError: null } });
      sent++;
    } else {
      await prisma.reservation.update({ where: { id: r.id }, data: { reminderError: result.error } });
      failed++;
    }
  }

  return { sent, failed };
}
