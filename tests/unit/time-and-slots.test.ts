import { describe, expect, it } from "vitest";
import { buildSlotTimesForDay } from "@/lib/slots";
import { addDaysToKey, dateKeyInTz, dayRangeUtc, isValidDateKey, weekdayOfKey, zonedToUtc } from "@/lib/time";

const rules = { minutes: 30, open: "09:00", close: "15:00", workingDays: [1, 2, 3, 4, 5] };

describe("time helpers", () => {
  it("converts Kabul wall-clock time (UTC+4:30) to UTC", () => {
    expect(zonedToUtc(2026, 11, 9, 9, 0, "Asia/Kabul").toISOString()).toBe("2026-11-09T04:30:00.000Z");
  });

  it("finds the calendar day in a timezone, not in UTC", () => {
    // 20:00 UTC is already the next day in Kabul.
    expect(dateKeyInTz(new Date("2026-11-09T20:00:00Z"), "Asia/Kabul")).toBe("2026-11-10");
  });

  it("adds days across month ends", () => {
    expect(addDaysToKey("2026-11-30", 1)).toBe("2026-12-01");
    expect(addDaysToKey("2026-03-01", -1)).toBe("2026-02-28");
  });

  it("validates date keys", () => {
    expect(isValidDateKey("2026-02-30")).toBe(false);
    expect(isValidDateKey("2026-11-09")).toBe(true);
    expect(isValidDateKey("09/11/2026")).toBe(false);
  });

  it("knows the weekday", () => {
    expect(weekdayOfKey("2026-11-09")).toBe(1); // Monday
  });

  it("gives a 24-hour day range", () => {
    const { start, end } = dayRangeUtc("2026-11-09", "Asia/Kabul");
    expect(end.getTime() - start.getTime()).toBe(24 * 60 * 60_000);
  });
});

describe("slot generation", () => {
  it("creates 12 half-hour slots between 09:00 and 15:00", () => {
    const slots = buildSlotTimesForDay("2026-11-09", rules, "Asia/Kabul");
    expect(slots).toHaveLength(12);
    expect(slots[0]!.start.toISOString()).toBe("2026-11-09T04:30:00.000Z");
    expect(slots[11]!.end.toISOString()).toBe("2026-11-09T10:30:00.000Z");
  });

  it("creates nothing on days off", () => {
    expect(buildSlotTimesForDay("2026-11-08", rules, "Asia/Kabul")).toEqual([]); // Sunday
  });

  it("never overlaps slots", () => {
    const slots = buildSlotTimesForDay("2026-11-09", rules, "Asia/Kabul");
    for (let i = 1; i < slots.length; i++) {
      expect(slots[i]!.start.getTime()).toBe(slots[i - 1]!.end.getTime());
    }
  });
});
