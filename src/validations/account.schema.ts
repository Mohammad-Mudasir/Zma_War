import { z } from "zod";
import { isValidReminderMinutes } from "@/lib/constants";
import { emailRule, passwordRule } from "./auth.schema";

export const reminderMinutesRule = z.coerce
  .number({ invalid_type_error: "Choose a reminder time" })
  .int()
  .refine(isValidReminderMinutes, "Choose one of the listed reminder times");

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80, "That name is too long"),
  email: emailRule,
  // "" means "use the hospital default".
  defaultReminderMinutes: z.preprocess(
    (v) => (v === "" || v === undefined ? null : v),
    reminderMinutesRule.nullable(),
  ),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "The passwords don't match",
  });
