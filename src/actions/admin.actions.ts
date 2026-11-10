"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSession, destroySession, requireAdmin } from "@/lib/auth";
import { reminderLabel } from "@/lib/constants";
import { errorState, parseForm } from "@/lib/form";
import { allow } from "@/lib/rate-limit";
import { getClientIp, safeNextPath } from "@/lib/utils";
import { loginAdmin } from "@/services/auth.service";
import { setDefaultReminderMinutes } from "@/services/reminder.service";
import { cancelReservation, createReservation } from "@/services/reservation.service";
import { findUserByEmail } from "@/services/user.service";
import { loginSchema } from "@/validations/auth.schema";
import { reminderMinutesRule } from "@/validations/account.schema";
import { adminCreateSchema, cancelSchema } from "@/validations/reservation.schema";
import { z } from "zod";
import type { FormState } from "@/types/api.types";

function refresh() {
  for (const path of [
    "/admin/dashboard",
    "/admin/appointments",
    "/admin/reservations",
    "/appointments",
    "/appointments/future",
    "/reservations",
    "/dashboard",
  ]) {
    revalidatePath(path);
  }
}

export async function adminLoginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseForm(loginSchema, formData);
  if (!parsed.ok) return parsed.state;

  const ip = getClientIp(await headers());
  if (!allow(`admin-login:${ip}`, 6, 15 * 60_000)) {
    return { status: "error", message: "Too many attempts. Please wait a few minutes and try again." };
  }

  try {
    const admin = await loginAdmin(parsed.data.email, parsed.data.password);
    if (!admin) {
      return {
        status: "error",
        message: "That email and password don't match.",
        values: { email: parsed.data.email },
      };
    }
    await createSession({ id: admin.id, role: "admin", name: admin.name });
  } catch (err) {
    return errorState(err);
  }

  redirect(safeNextPath(formData.get("next"), "/admin/dashboard"));
}

export async function adminLogoutAction(): Promise<void> {
  await destroySession();
  redirect("/admin/login");
}

/** FR-08: the administrator reserves a slot on behalf of a user. */
export async function adminCreateReservationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(adminCreateSchema, formData);
  if (!parsed.ok) return parsed.state;

  try {
    const user = await findUserByEmail(parsed.data.email);
    if (!user) {
      return {
        status: "error",
        message: "Please fix the highlighted fields.",
        fieldErrors: { email: "No account uses this email address." },
        values: { email: parsed.data.email },
      };
    }
    const r = await createReservation({
      userId: user.id,
      appointmentId: parsed.data.appointmentId,
      reminderLeadMinutes: parsed.data.reminderLeadMinutes,
      createdByAdmin: true,
    });
    refresh();
    return { status: "success", message: `Reserved ${r.dayShort}, ${r.start} for ${user.name}.` };
  } catch (err) {
    refresh();
    return errorState(err);
  }
}

/** FR-09: the administrator deletes a reservation; the user is emailed. */
export async function adminCancelReservationAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(cancelSchema, formData);
  if (!parsed.ok) return parsed.state;

  try {
    const { reservation, emailSent } = await cancelReservation({
      reservationId: parsed.data.reservationId,
      actor: { type: "admin" },
    });
    refresh();
    const who = reservation.user.name;
    if (emailSent === null) return { status: "success", message: `Reservation for ${who} cancelled.` };
    return {
      status: "success",
      message: emailSent
        ? `Reservation cancelled. ${who} was emailed and invited to pick another time.`
        : `Reservation cancelled, but the email to ${who} could not be sent. Please contact them directly.`,
    };
  } catch (err) {
    refresh();
    return errorState(err);
  }
}

/** FR-07: administrator configures the default reminder lead time. */
export async function saveReminderSettingAction(_prev: FormState, formData: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = parseForm(z.object({ defaultReminderMinutes: reminderMinutesRule }), formData);
  if (!parsed.ok) return parsed.state;

  try {
    await setDefaultReminderMinutes(parsed.data.defaultReminderMinutes);
    revalidatePath("/admin/settings");
    return {
      status: "success",
      message: `New reservations will suggest a reminder ${reminderLabel(parsed.data.defaultReminderMinutes)} before.`,
    };
  } catch (err) {
    return errorState(err);
  }
}
