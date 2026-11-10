"use client";

import { useActionState } from "react";
import { updateReminderAction } from "@/actions/reservation.actions";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { controlClass } from "@/components/ui/Input";
import { REMINDER_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { initialFormState } from "@/types/api.types";

/** Lets someone change how long before the appointment their reminder is sent (FR-06, FR-11). */
export function ReminderForm({ reservationId, current }: { reservationId: number; current: number }) {
  const [state, action] = useActionState(updateReminderAction, initialFormState);
  const id = `reminder-${reservationId}`;

  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="reservationId" value={reservationId} />
      <label htmlFor={id} className="block text-sm font-semibold">
        Email reminder
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <select id={id} name="reminderLeadMinutes" defaultValue={current} className={cn(controlClass, "h-9 w-auto min-w-44 text-sm")}>
          {REMINDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <SubmitButton variant="secondary" size="sm" pendingLabel="Saving…">
          Save
        </SubmitButton>
      </div>
      {state.status !== "idle" && state.message && (
        <p role={state.status === "error" ? "alert" : "status"} className={cn("text-sm font-medium", state.status === "error" ? "text-pomegranate-700" : "text-pine-700")}>
          {state.status === "success" ? "✓ " : ""}
          {state.message}
        </p>
      )}
    </form>
  );
}
