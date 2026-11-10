/** The shape every form action returns, so forms can show consistent feedback. */
export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** One message per field name. */
  fieldErrors?: Record<string, string>;
  /** Submitted values (never passwords) so a form can refill after an error. */
  values?: Record<string, string>;
};

export const initialFormState: FormState = { status: "idle" };

export type VerifyResult = "success" | "invalid" | "expired";
