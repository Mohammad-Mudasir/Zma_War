import { reminderLabel } from "@/lib/constants";
import type { ReservationView } from "@/types/reservation.types";
import { CancelButton } from "./CancelButton";
import { ReminderForm } from "./ReminderForm";

/** One upcoming reservation, drawn as a queue ticket. */
export function AppointmentCard({ reservation: r, manage = false }: { reservation: ReservationView; manage?: boolean }) {
  const [time, period] = r.start.split(" ");

  return (
    <article className="ticket" aria-label={`Appointment on ${r.dayLong} at ${r.start}`}>
      <div className="ticket-stub flex flex-col items-center justify-center px-3 py-6 text-center">
        <p className="font-display text-4xl font-bold leading-none text-pine-800">{time}</p>
        <p className="mt-1 font-semibold text-pine-700">{period}</p>
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div>
          <h3 className="text-xl font-semibold">{r.dayLong}</h3>
          <p className="text-muted">
            {r.start} to {r.end} · Ticket #{r.ticketNo}
          </p>
          {r.createdByAdmin && <p className="mt-1 text-sm text-muted">Booked for you by the hospital.</p>}
        </div>

        {manage ? (
          <div className="flex flex-wrap items-end justify-between gap-4">
            {r.reminderSent ? (
              <p className="text-sm font-medium text-pine-700">✓ Reminder sent</p>
            ) : (
              <ReminderForm reservationId={r.id} current={r.reminderLeadMinutes} />
            )}
            <CancelButton reservationId={r.id} when={`${r.dayLong}, ${r.start}`} />
          </div>
        ) : (
          <p className="text-sm text-muted">
            {r.reminderSent ? "Reminder sent" : `Reminder ${reminderLabel(r.reminderLeadMinutes)} before`}
          </p>
        )}
      </div>
    </article>
  );
}
