"use client";

import { useActionState, useState } from "react";
import { adminCancelReservationAction } from "@/actions/admin.actions";
import { cancelMyReservationAction } from "@/actions/reservation.actions";
import { Button } from "@/components/ui/Button";
import { FormMessage } from "@/components/ui/FormMessage";
import { Modal } from "@/components/ui/Modal";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialFormState } from "@/types/api.types";

type Props = {
  reservationId: number;
  /** "Monday 9 November, 9:00 AM" */
  when: string;
  /** When set, the administrator is cancelling for this person and they'll be emailed. */
  adminFor?: string;
  label?: string;
};

export function CancelButton({ reservationId, when, adminFor, label = "Cancel" }: Props) {
  const [open, setOpen] = useState(false);
  const [state, action] = useActionState(adminFor ? adminCancelReservationAction : cancelMyReservationAction, initialFormState);
  const done = state.status === "success";

  return (
    <>
      <Button variant="dangerOutline" size="sm" onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title={done ? "Cancelled" : "Cancel this reservation?"}>
        {done ? (
          <div className="space-y-5">
            <FormMessage state={state} />
            <Button onClick={() => setOpen(false)}>Done</Button>
          </div>
        ) : (
          <form action={action} className="space-y-5">
            <input type="hidden" name="reservationId" value={reservationId} />
            <p>
              {adminFor ? (
                <>
                  This cancels <strong>{adminFor}</strong>’s appointment on <strong>{when}</strong>. We’ll email them and invite
                  them to choose another time.
                </>
              ) : (
                <>
                  You’re about to give up your appointment on <strong>{when}</strong>. The time will open up for someone else.
                </>
              )}
            </p>
            <FormMessage state={state} />
            <div className="flex flex-wrap gap-3">
              <SubmitButton variant="danger" pendingLabel="Cancelling…">
                Yes, cancel it
              </SubmitButton>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Keep it
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </>
  );
}
