"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { reminderLabel } from "@/lib/constants";
import { errorState, parseForm } from "@/lib/form";
import { cancelReservation, createReservation, updateReservationReminder } from "@/services/reservation.service";
import { cancelSchema, reserveSchema, updateReminderSchema } from "@/validations/reservation.schema";
import type { FormState } from "@/types/api.types";

function refresh() {
  for (const path of ["/appointments", "/appointments/future", "/reservations", "/dashboard"]) revalidatePath(path);
}

export async function reserveSlotAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = parseForm(reserveSchema, formData);
  if (!parsed.ok) return parsed.state;

  try {
    const r = await createReservation({
      userId: user.id,
      appointmentId: parsed.data.appointmentId,
      reminderLeadMinutes: parsed.data.reminderLeadMinutes,
    });
    refresh();
    return {
      status: "success",
      message: `You're booked for ${r.dayLong} at ${r.start}. We'll email you ${reminderLabel(r.reminderLeadMinutes)} before.`,
    };
  } catch (err) {
    refresh(); // the slot list may have changed under the user
    return errorState(err);
  }
}

export async function cancelMyReservationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = parseForm(cancelSchema, formData);
  if (!parsed.ok) return parsed.state;

  try {
    await cancelReservation({ reservationId: parsed.data.reservationId, actor: { type: "user", userId: user.id } });
    refresh();
    return { status: "success", message: "Your reservation was cancelled and the time is open again." };
  } catch (err) {
    return errorState(err);
  }
}

export async function updateReminderAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = parseForm(updateReminderSchema, formData);
  if (!parsed.ok) return parsed.state;

  try {
    await updateReservationReminder({ userId: user.id, ...parsed.data });
    refresh();
    return { status: "success", message: `Reminder set for ${reminderLabel(parsed.data.reminderLeadMinutes)} before.` };
  } catch (err) {
    return errorState(err);
  }
}
