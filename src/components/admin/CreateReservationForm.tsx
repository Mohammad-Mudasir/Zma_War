"use client";

import { useActionState, useId, useState } from "react";
import { adminCreateReservationAction } from "@/actions/admin.actions";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input, Select } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { REMINDER_OPTIONS } from "@/lib/constants";
import { initialFormState } from "@/types/api.types";

type Props = {
  slotId: number;
  slotLabel: string;
  defaultMinutes: number;
  users: Array<{ name: string; email: string }>;
};

/** FR-08: reserve a slot on behalf of a user. */
export function CreateReservationForm({ slotId, slotLabel, defaultMinutes, users }: Props) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(adminCreateReservationAction, initialFormState);
  const listId = useId();
  const done = state.status === "success";

  return (
    <>
      <Button size="sm" variant="secondary" onClick={() => setOpen(true)}>
        Reserve for someone
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={done ? "Reserved" : "Reserve for a user"}>
        {done ? (
          <div className="space-y-5">
            <FormMessage state={state} />
            <Button onClick={() => setOpen(false)}>Done</Button>
          </div>
        ) : (
          <form action={action} className="space-y-5">
            <input type="hidden" name="appointmentId" value={slotId} />
            <p className="rounded-xl bg-pine-50 px-4 py-3 font-semibold text-pine-800">{slotLabel}</p>
            <FormMessage state={state} />
            <Input
              label="User’s email address"
              name="email"
              type="email"
              list={listId}
              required
              autoComplete="off"
              defaultValue={state.values?.email}
              error={state.fieldErrors?.email}
              hint="Start typing to pick from registered users."
            />
            <datalist id={listId}>
              {users.map((u) => (
                <option key={u.email} value={u.email}>
                  {u.name}
                </option>
              ))}
            </datalist>
            <Select
              label="Reminder email"
              name="reminderLeadMinutes"
              defaultValue={defaultMinutes}
              options={REMINDER_OPTIONS}
              error={state.fieldErrors?.reminderLeadMinutes}
            />
            <div className="flex flex-wrap gap-3">
              <SubmitButton pendingLabel="Reserving…">Reserve</SubmitButton>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
