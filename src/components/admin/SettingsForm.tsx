"use client";

import { useActionState } from "react";
import { saveReminderSettingAction } from "@/actions/admin.actions";
import { FormMessage } from "@/components/ui/FormMessage";
import { Select } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { REMINDER_OPTIONS } from "@/lib/constants";
import { initialFormState } from "@/types/api.types";

export function SettingsForm({ current }: { current: number }) {
  const [state, action] = useActionState(saveReminderSettingAction, initialFormState);
  return (
    <form action={action} className="max-w-md space-y-5 rounded-3xl border border-line bg-surface p-6 sm:p-8">
      <div>
        <h2 className="text-2xl font-semibold">Reminder email</h2>
        <p className="text-muted">
          The time suggested when someone reserves. People can still choose their own for each appointment.
        </p>
      </div>
      <FormMessage state={state} />
      <Select
        label="Send the reminder"
        name="defaultReminderMinutes"
        defaultValue={current}
        options={REMINDER_OPTIONS}
        error={state.fieldErrors?.defaultReminderMinutes}
      />
      <SubmitButton pendingLabel="Saving…">Save setting</SubmitButton>
    </form>
  );
}
