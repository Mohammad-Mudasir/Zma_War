import { prisma } from "@/lib/prisma";
import { SLOT, TIMEZONE } from "@/lib/config";
import { BOOKING_WINDOW_DAYS } from "@/lib/constants";
import { buildSlotTimesForDay } from "@/lib/slots";
import {
  addDaysToKey,
  dateKeyInTz,
  dayHeading,
  dayRangeUtc,
  formatDayLong,
  formatDayShort,
  formatTime,
} from "@/lib/time";
import type { AdminSlotView, DayGroup, SlotView } from "@/types/appointment.types";

type SlotRow = { id: number; startTime: Date; endTime: Date; isReserved: boolean };

export function toSlotView(row: SlotRow): SlotView {
  return {
    id: row.id,
    startsAt: row.startTime.toISOString(),
    dateKey: dateKeyInTz(row.startTime, TIMEZONE),
    dayShort: formatDayShort(row.startTime),
    dayLong: formatDayLong(row.startTime),
    start: formatTime(row.startTime),
    end: formatTime(row.endTime),
    isReserved: row.isReserved,
  };
}

/** The window in which slots may be booked: from now until BOOKING_WINDOW_DAYS from now. */
export function bookingWindow(now: Date = new Date()): { from: Date; to: Date } {
  return { from: now, to: new Date(now.getTime() + BOOKING_WINDOW_DAYS * 24 * 60 * 60_000) };
}

/** Creates any missing slots for the next `daysAhead` days. Safe to run repeatedly. */
export async function ensureUpcomingSlots(daysAhead: number = SLOT.generateDaysAhead): Promise<number> {
  const today = dateKeyInTz(new Date());
  const data: Array<{ startTime: Date; endTime: Date }> = [];

  for (let i = 0; i <= daysAhead; i++) {
    for (const { start, end } of buildSlotTimesForDay(addDaysToKey(today, i))) {
      data.push({ startTime: start, endTime: end });
    }
  }
  if (data.length === 0) return 0;

  const result = await prisma.appointment.createMany({ data, skipDuplicates: true });
  return result.count;
}

let lastEnsured = 0;
/** Keeps the calendar topped up even if the worker isn't running. At most once an hour per process. */
export async function ensureUpcomingSlotsThrottled(): Promise<void> {
  if (Date.now() - lastEnsured < 60 * 60_000) return;
  lastEnsured = Date.now();
  try {
    await ensureUpcomingSlots();
  } catch (err) {
    lastEnsured = 0;
    console.error("[slots] Could not top up slots:", err);
  }
}

/** Open and reserved slots for the next `count` days, grouped by day (FR-01). */
export async function getUpcomingDays(count: number): Promise<DayGroup[]> {
  await ensureUpcomingSlotsThrottled();
  const now = new Date();
  const today = dateKeyInTz(now);
  const keys = Array.from({ length: count }, (_, i) => addDaysToKey(today, i));
  const { end } = dayRangeUtc(keys[keys.length - 1]!);

  const rows = await prisma.appointment.findMany({
    where: { startTime: { gt: now, lt: end } },
    orderBy: { startTime: "asc" },
  });

  return keys.map((key) => ({
    dateKey: key,
    heading: dayHeading(key, today),
    slots: rows.map(toSlotView).filter((s) => s.dateKey === key),
  }));
}

/** Slots that haven't started yet on one specific day. */
export async function getSlotsForDay(dateKey: string): Promise<SlotView[]> {
  await ensureUpcomingSlotsThrottled();
  const now = new Date();
  const { start, end } = dayRangeUtc(dateKey);
  const rows = await prisma.appointment.findMany({
    where: { startTime: { gt: now, gte: start, lt: end } },
    orderBy: { startTime: "asc" },
  });
  return rows.map(toSlotView);
}

export async function getNextAvailableSlot(): Promise<SlotView | null> {
  await ensureUpcomingSlotsThrottled();
  const { from, to } = bookingWindow();
  const row = await prisma.appointment.findFirst({
    where: { isReserved: false, startTime: { gt: from, lte: to } },
    orderBy: { startTime: "asc" },
  });
  return row ? toSlotView(row) : null;
}

/** Every slot on a day, past ones included, with who holds it (admin view). */
export async function getAdminSlotsForDay(dateKey: string): Promise<AdminSlotView[]> {
  await ensureUpcomingSlotsThrottled();
  const now = new Date();
  const { start, end } = dayRangeUtc(dateKey);
  const rows = await prisma.appointment.findMany({
    where: { startTime: { gte: start, lt: end } },
    orderBy: { startTime: "asc" },
    include: {
      reservations: { where: { status: "ACTIVE" }, include: { user: { select: { name: true, email: true } } } },
    },
  });

  return rows.map((row) => {
    const active = row.reservations[0];
    return {
      ...toSlotView(row),
      isPast: row.endTime <= now,
      reservation: active
        ? { id: active.id, userName: active.user.name, userEmail: active.user.email }
        : null,
    };
  });
}
