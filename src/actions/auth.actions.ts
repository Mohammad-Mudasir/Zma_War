"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSession, destroySession, requireUser } from "@/lib/auth";
import { errorState, parseForm } from "@/lib/form";
import { ServiceError } from "@/lib/errors";
import { allow } from "@/lib/rate-limit";
import { getClientIp, safeNextPath } from "@/lib/utils";
import { loginUser, registerUser, sendVerificationEmail } from "@/services/auth.service";
import { loginSchema, registerSchema } from "@/validations/auth.schema";
import type { FormState } from "@/types/api.types";

export async function registerAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const ip = getClientIp(await headers());
  if (!allow(`register:${ip}`, 10, 60 * 60_000)) {
    return { status: "error", message: "Too many sign-up attempts. Please try again in an hour." };
  }

  const parsed = parseForm(registerSchema, formData);
  if (!parsed.ok) return parsed.state;

  let emailSent = false;
  try {
    const { user, emailSent: sent } = await registerUser(parsed.data);
    emailSent = sent;
    await createSession({ id: user.id, role: "user", name: user.name });
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

  redirect(emailSent ? "/verify-email?sent=1" : "/verify-email?sent=0");
}

export async function loginAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = parseForm(loginSchema, formData);
  if (!parsed.ok) return parsed.state;

  const ip = getClientIp(await headers());
  if (!allow(`login:${ip}:${parsed.data.email}`, 8, 15 * 60_000)) {
    return { status: "error", message: "Too many attempts. Please wait a few minutes and try again." };
  }

  try {
    const user = await loginUser(parsed.data.email, parsed.data.password);
    if (!user) {
      // Deliberately vague: don't reveal whether the email exists.
      return {
        status: "error",
        message: "That email and password don't match. Check them and try again.",
        values: { email: parsed.data.email },
      };
    }
    await createSession({ id: user.id, role: "user", name: user.name });
  } catch (err) {
    return errorState(err);
  }

  redirect(safeNextPath(formData.get("next")));
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/");
}

export async function resendVerificationAction(): Promise<FormState> {
  const user = await requireUser();
  if (user.emailVerified) return { status: "success", message: "Your email address is already verified." };

  if (!allow(`resend:${user.id}`, 3, 10 * 60_000)) {
    return { status: "error", message: "We just sent one. Please wait a few minutes before asking for another." };
  }
  const sent = await sendVerificationEmail(user);
  return sent
    ? { status: "success", message: `We sent a new link to ${user.email}.` }
    : { status: "error", message: "We couldn't send the email right now. Please try again later." };
}
