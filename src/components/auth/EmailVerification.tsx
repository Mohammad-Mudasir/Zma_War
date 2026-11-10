"use client";

import { useActionState } from "react";
import { resendVerificationAction } from "@/actions/auth.actions";
import { FormMessage } from "@/components/ui/FormMessage";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialFormState } from "@/types/api.types";

/** "Send me another link" button for signed-in, unverified users. */
export function EmailVerification() {
  const [state, action] = useActionState(() => resendVerificationAction(), initialFormState);
  return (
    <form action={action} className="space-y-3">
      <FormMessage state={state} />
      <SubmitButton variant="secondary" pendingLabel="Sending…">
        Send me a new link
      </SubmitButton>
    </form>
  );
}
