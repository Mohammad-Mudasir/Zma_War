import { SLOT, TIMEZONE } from "./config";
import { weekdayOfKey, zonedToUtc } from "./time";

export type SlotRules = {
  minutes: number;
  open: string;
  close: string;
  workingDays: number[];
};

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number) as [number, number];
  return h * 60 + m;
}

/** The slot start/end times (UTC) that make up one working day. Empty on days off. */
export function buildSlotTimesForDay(
  dateKey: string,
  rules: SlotRules = SLOT,
  tz: string = TIMEZONE,
): Array<{ start: Date; end: Date }> {
  if (!rules.workingDays.includes(weekdayOfKey(dateKey))) return [];

  const [y, m, d] = dateKey.split("-").map(Number) as [number, number, number];
  const openMin = toMinutes(rules.open);
  const closeMin = toMinutes(rules.close);
  const slots: Array<{ start: Date; end: Date }> = [];

  for (let t = openMin; t + rules.minutes <= closeMin; t += rules.minutes) {
    const start = zonedToUtc(y, m, d, Math.floor(t / 60), t % 60, tz);
    slots.push({ start, end: new Date(start.getTime() + rules.minutes * 60_000) });
  }
  return slots;
}
