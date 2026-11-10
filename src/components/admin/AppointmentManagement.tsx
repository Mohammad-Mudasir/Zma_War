import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { EmptyRow, Table, Td, Th } from "@/components/ui/Table";
import { controlClass } from "@/components/ui/Input";
import { CancelButton } from "@/components/user/CancelButton";
import { addDaysToKey } from "@/lib/time";
import { cn } from "@/lib/utils";
import type { AdminSlotView } from "@/types/appointment.types";
import { CreateReservationForm } from "./CreateReservationForm";

type Props = {
  dateKey: string;
  heading: string;
  slots: AdminSlotView[];
  users: Array<{ name: string; email: string }>;
  defaultMinutes: number;
};

/** The slot schedule for one day, with who holds each slot and the admin actions. */
export function AppointmentManagement({ dateKey, heading, slots, users, defaultMinutes }: Props) {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold sm:text-4xl">Schedule</h1>
        <p className="text-muted">See who holds each time, book on someone’s behalf, or cancel a reservation.</p>
      </header>

      <div className="flex flex-wrap items-end gap-3">
        <Link href={`/admin/appointments?date=${addDaysToKey(dateKey, -1)}`} className={buttonClass({ variant: "secondary", size: "sm" })}>
          Previous day
        </Link>
        <form method="get" className="flex items-end gap-2">
          <div>
            <label htmlFor="date" className="mb-1 block text-sm font-semibold">
              Date
            </label>
            <input id="date" name="date" type="date" defaultValue={dateKey} required className={cn(controlClass, "h-9 w-auto text-sm")} />
          </div>
          <button type="submit" className={buttonClass({ variant: "secondary", size: "sm" })}>
            Show
          </button>
        </form>
        <Link href={`/admin/appointments?date=${addDaysToKey(dateKey, 1)}`} className={buttonClass({ variant: "secondary", size: "sm" })}>
          Next day
        </Link>
      </div>

      <section aria-labelledby="day-heading" className="space-y-3">
        <h2 id="day-heading" className="text-2xl font-semibold">
          {heading}
        </h2>
        <Table caption={`Appointment slots for ${heading}`}>
          <thead>
            <tr>
              <Th>Time</Th>
              <Th>Status</Th>
              <Th>Person</Th>
              <Th className="text-right">
                <span className="sr-only">Actions</span>
              </Th>
            </tr>
          </thead>
          <tbody>
            {slots.length === 0 && <EmptyRow colSpan={4}>No slots on this day. The hospital isn’t open.</EmptyRow>}
            {slots.map((s) => (
              <tr key={s.id} className={s.isPast ? "opacity-60" : undefined}>
                <Td className="font-semibold">
                  {s.start} <span className="font-normal text-muted">to {s.end}</span>
                </Td>
                <Td>{s.reservation ? <Badge tone="reserved">Reserved</Badge> : <Badge tone="available">Available</Badge>}</Td>
                <Td>
                  {s.reservation ? (
                    <>
                      <p className="font-medium">{s.reservation.userName}</p>
                      <p className="text-sm text-muted">{s.reservation.userEmail}</p>
                    </>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </Td>
                <Td className="text-right">
                  {!s.isPast &&
                    (s.reservation ? (
                      <CancelButton
                        reservationId={s.reservation.id}
                        when={`${s.dayShort}, ${s.start}`}
                        adminFor={s.reservation.userName}
                      />
                    ) : (
                      <CreateReservationForm
                        slotId={s.id}
                        slotLabel={`${s.dayLong}, ${s.start} – ${s.end}`}
                        defaultMinutes={defaultMinutes}
                        users={users}
                      />
                    ))}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </div>
  );
}
