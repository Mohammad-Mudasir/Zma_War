import { z } from "zod";
import { isValidDateKey } from "@/lib/time";

export const dateKeySchema = z.string().refine(isValidDateKey, "Pick a valid date");

export const reminderSettingSchema = z.object({
  defaultReminderMinutes: z.coerce.number().int().min(1),
});
