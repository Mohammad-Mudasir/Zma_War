"use server";

import { revalidatePath } from "next/cache";
import { createSession, requireUser } from "@/lib/auth";
import { errorState, parseForm } from "@/lib/form";
import { ServiceError } from "@/lib/errors";
import { changePassword, updateProfile } from "@/services/user.service";
import { passwordChangeSchema, profileSchema } from "@/validations/account.schema";
import type { FormState } from "@/types/api.types";

export async function updateProfileAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = parseForm(profileSchema, formData);
  if (!parsed.ok) return parsed.state;

  try {
    const { emailChanged, emailSent } = await updateProfile(user.id, parsed.data);
    await createSession({ id: user.id, role: "user", name: parsed.data.name }); // keep the cookie's name current
    revalidatePath("/", "layout");

    if (emailChanged) {
      return {
        status: "success",
        message: emailSent
          ? "Saved. We sent a link to your new email address. Please verify it before booking again."
          : "Saved, but we couldn't send the verification email. Use “Resend” on the verification page.",
      };
    }
    return { status: "success", message: "Your details are saved." };
  } catch (err) {
    if (err instanceof ServiceError && err.code === "EMAIL_TAKEN") {
      return {
        status: "error",
        message: "Please fix the highlighted fields.",
        fieldErrors: { email: err.message },
        values: { name: parsed.data.name, email: parsed.data.email },
      };
    }
    return errorState(err);
  }
}

export async function changePasswordAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const parsed = parseForm(passwordChangeSchema, formData);
  if (!parsed.ok) return parsed.state;

  try {
    await changePassword(user.id, parsed.data.currentPassword, parsed.data.newPassword);
    return { status: "success", message: "Your password was changed." };
  } catch (err) {
    if (err instanceof ServiceError && err.code === "WRONG_PASSWORD") {
      return { status: "error", message: "Please fix the highlighted fields.", fieldErrors: { currentPassword: err.message } };
    }
    return errorState(err);
  }
}
