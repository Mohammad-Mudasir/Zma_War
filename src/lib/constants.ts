// Values that are safe to import from both server and client code.

export const APP_NAME = "Zma Wār";
export const APP_TAGLINE = "my turn";

/** FR-13: a user can hold at most this many upcoming reservations. */
export const MAX_ACTIVE_RESERVATIONS = 2;
/** FR-05: slots can be booked up to this many days ahead. */
export const BOOKING_WINDOW_DAYS = 30;
/** FR-06: default reminder lead time. */
export const DEFAULT_REMINDER_MINUTES = 30;
export const MAX_REMINDER_ATTEMPTS = 3;
export const VERIFICATION_TTL_HOURS = 24;

export const REMINDER_OPTIONS = [
  { value: 10, label: "10 minutes before" },
  { value: 15, label: "15 minutes before" },
  { value: 30, label: "30 minutes before" },
  { value: 60, label: "1 hour before" },
  { value: 120, label: "2 hours before" },
  { value: 1440, label: "1 day before" },
] as const;

export const MAX_REMINDER_MINUTES = Math.max(...REMINDER_OPTIONS.map((o) => o.value));

export function isValidReminderMinutes(value: number): boolean {
  return REMINDER_OPTIONS.some((o) => o.value === value);
}

/** "30 minutes", "1 hour", "1 day" */
export function reminderLabel(minutes: number): string {
  if (minutes % 1440 === 0) {
    const d = minutes / 1440;
    return `${d} ${d === 1 ? "day" : "days"}`;
  }
  if (minutes % 60 === 0) {
    const h = minutes / 60;
    return `${h} ${h === 1 ? "hour" : "hours"}`;
  }
  return `${minutes} minutes`;
}

export const SESSION_COOKIE = "zw_session";
