// Server-side configuration read from environment variables.
// Secrets never live in source code (SDD 4.5 / 8).

function int(value: string | undefined, fallback: number): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) ? n : fallback;
}

export const HOSPITAL_NAME = process.env.HOSPITAL_NAME ?? "Safa Community Hospital";

/** One timezone for the whole system. Times are stored as UTC and shown in this zone. */
export const TIMEZONE = process.env.APP_TIMEZONE ?? "Asia/Kabul";

export const APP_URL = (process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "");

/** How appointment slots are laid out each day. Override with env vars if needed. */
export const SLOT = {
  minutes: int(process.env.SLOT_MINUTES, 30),
  open: process.env.SLOT_OPEN ?? "09:00",
  close: process.env.SLOT_CLOSE ?? "15:00",
  /** 0 = Sunday … 6 = Saturday. Default is Monday to Friday. */
  workingDays: (process.env.SLOT_WORKING_DAYS ?? "1,2,3,4,5")
    .split(",")
    .map((d) => Number.parseInt(d.trim(), 10))
    .filter((d) => d >= 0 && d <= 6),
  /** How far ahead slots are generated (a little beyond the 30-day booking window). */
  generateDaysAhead: int(process.env.SLOT_GENERATE_DAYS, 35),
};

export const isProduction = process.env.NODE_ENV === "production";
