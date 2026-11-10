"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { reserveSlotAction } from "@/actions/reservation.actions";
import { Button, buttonClass } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { REMINDER_OPTIONS } from "@/lib/constants";
import { initialFormState } from "@/types/api.types";

type Props = {
  slotId: number;
  slotLabel: string; // e.g. "Monday 9 November, 9:00 AM – 9:30 AM"
  defaultMinutes: number;
  signedIn: boolean;
  verified: boolean;
  /** Where to send a signed-out visitor back to after they sign in. */
  returnTo: string;
};

export function ReserveButton({ slotId, slotLabel, defaultMinutes, signedIn, verified, returnTo }: Props) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(reserveSlotAction, initialFormState);

  if (!signedIn) {
    return (
      <Link
        href={`/login?next=${encodeURIComponent(returnTo)}`}
        className={buttonClass({ variant: "secondary", size: "sm" })}
      >
        Sign in to reserve
      </Link>
    );
  }
  if (!verified) {
    return (
      <Link href="/verify-email" className={buttonClass({ variant: "secondary", size: "sm" })}>
        Verify email to reserve
      </Link>
    );
  }

  const done = state.status === "success";

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Reserve
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={done ? "You’re booked" : "Reserve this time"}>
        {done ? (
          <div className="space-y-5">
            <FormMessage state={state} />
            <div className="flex flex-wrap gap-3">
              <Link href="/reservations" className={buttonClass({})}>
                See my reservations
              </Link>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form action={action} className="space-y-5">
            <input type="hidden" name="appointmentId" value={slotId} />
            <p className="rounded-xl bg-pine-50 px-4 py-3 font-semibold text-pine-800">{slotLabel}</p>
            <FormMessage state={state} />
            <Select
              label="Remind me by email"
              name="reminderLeadMinutes"
              defaultValue={defaultMinutes}
              options={REMINDER_OPTIONS}
              error={state.fieldErrors?.reminderLeadMinutes}
              hint="You can change this later from your reservations."
            />
            <div className="flex flex-wrap gap-3">
              <SubmitButton pendingLabel="Reserving…">Confirm reservation</SubmitButton>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Not now
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
