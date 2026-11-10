import { z } from "zod";
import { ServiceError } from "./errors";
import type { FormState } from "@/types/api.types";

const SECRET_FIELDS = new Set(["password", "confirmPassword", "currentPassword", "newPassword"]);

type ParseResult<T> = { ok: true; data: T } | { ok: false; state: FormState };

/** Validates a form on the server and returns friendly per-field errors. */
export function parseForm<S extends z.ZodTypeAny>(schema: S, formData: FormData): ParseResult<z.infer<S>> {
  const raw: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$ACTION")) raw[key] = value;
  }

  const result = schema.safeParse(raw);
  if (result.success) return { ok: true, data: result.data };

  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = String(issue.path[0] ?? "form");
    fieldErrors[key] ??= issue.message;
  }

  // Send values back so the form can refill, but never passwords.
  const values = Object.fromEntries(Object.entries(raw).filter(([k]) => !SECRET_FIELDS.has(k)));

  return {
    ok: false,
    state: { status: "error", message: "Please fix the highlighted fields.", fieldErrors, values },
  };
}

/** Turns any thrown error into a safe form state (no stack traces or SQL details). */
export function errorState(err: unknown): FormState {
  if (err instanceof ServiceError) return { status: "error", message: err.message };
  console.error(err);
  return { status: "error", message: "Something went wrong on our side. Please try again." };
}
