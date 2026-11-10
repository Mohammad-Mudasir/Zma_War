import { describe, expect, it } from "vitest";
import { isReminderDue, reminderDueAt } from "@/services/reminder.service";
import { reminderLabel } from "@/lib/constants";

const start = new Date("2026-11-09T04:30:00Z");

describe("reminder timing", () => {
  it("is due once the lead time is reached", () => {
    expect(reminderDueAt(start, 30).toISOString()).toBe("2026-11-09T04:00:00.000Z");
    expect(isReminderDue(start, 30, new Date("2026-11-09T03:59:00Z"))).toBe(false);
    expect(isReminderDue(start, 30, new Date("2026-11-09T04:00:00Z"))).toBe(true);
  });

  it("is never due after the appointment has started", () => {
    expect(isReminderDue(start, 30, new Date("2026-11-09T04:31:00Z"))).toBe(false);
  });

  it("formats lead times for people", () => {
    expect(reminderLabel(30)).toBe("30 minutes");
    expect(reminderLabel(60)).toBe("1 hour");
    expect(reminderLabel(120)).toBe("2 hours");
    expect(reminderLabel(1440)).toBe("1 day");
  });
});
