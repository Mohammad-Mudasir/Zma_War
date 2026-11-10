import { z } from "zod";
import { emailRule } from "./auth.schema";
import { reminderMinutesRule } from "./account.schema";

const idRule = z.coerce.number().int().positive();

export const reserveSchema = z.object({
  appointmentId: idRule,
  reminderLeadMinutes: reminderMinutesRule,
});

export const updateReminderSchema = z.object({
  reservationId: idRule,
  reminderLeadMinutes: reminderMinutesRule,
});

export const cancelSchema = z.object({
  reservationId: idRule,
});

export const adminCreateSchema = z.object({
  email: emailRule,
  appointmentId: idRule,
  reminderLeadMinutes: reminderMinutesRule,
});
