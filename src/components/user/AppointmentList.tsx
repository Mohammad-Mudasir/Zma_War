import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import type { ReservationView } from "@/types/reservation.types";
import { AppointmentCard } from "./AppointmentCard";

export function AppointmentList({ reservations, manage = false }: { reservations: ReservationView[]; manage?: boolean }) {
  if (reservations.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-line bg-surface px-6 py-12 text-center">
        <p className="font-display text-2xl font-semibold">Nothing booked yet</p>
        <p className="mx-auto mt-2 max-w-sm text-muted">When you reserve a time, it shows up here as a ticket you can manage.</p>
        <Link href="/appointments" className={buttonClass({ className: "mt-6" })}>
          Find a time
        </Link>
      </div>
    );
  }
  return (
    <div className="space-y-5">
      {reservations.map((r) => (
        <AppointmentCard key={r.id} reservation={r} manage={manage} />
      ))}
    </div>
  );
}
