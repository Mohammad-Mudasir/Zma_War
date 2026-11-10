import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { MAX_ACTIVE_RESERVATIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ReservationView } from "@/types/reservation.types";
import { AppointmentList } from "./AppointmentList";

export function UserDashboard({ upcoming, name, greeting }: { upcoming: ReservationView[]; name: string; greeting: string }) {
  const used = upcoming.length;
  const full = used >= MAX_ACTIVE_RESERVATIONS;

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold sm:text-4xl">
          {greeting}, {name}
        </h1>
        <p className="text-muted">
          {used === 0 ? "You have no upcoming appointments." : `Your next turn is ${upcoming[0]!.dayShort} at ${upcoming[0]!.start}.`}
        </p>
      </header>

      <section aria-labelledby="slots-heading" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-line bg-surface px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="flex gap-1.5" aria-hidden="true">
            {Array.from({ length: MAX_ACTIVE_RESERVATIONS }, (_, i) => (
              <span key={i} className={cn("size-3.5 rounded-full border-2 border-pine-600", i < used && "bg-pine-600")} />
            ))}
          </div>
          <div>
            <h2 id="slots-heading" className="font-semibold">
              {used} of {MAX_ACTIVE_RESERVATIONS} reservations in use
            </h2>
            <p className="text-sm text-muted">{full ? "Cancel one to book another time." : "You can reserve more times."}</p>
          </div>
        </div>
        {!full && (
          <Link href="/appointments" className={buttonClass({ size: "sm" })}>
            Find a time
          </Link>
        )}
      </section>

      <section aria-labelledby="upcoming-heading" className="space-y-4">
        <div className="flex items-baseline justify-between">
          <h2 id="upcoming-heading" className="text-2xl font-semibold">
            Upcoming
          </h2>
          {used > 0 && (
            <Link href="/reservations" className="font-semibold text-pine-700 underline">
              Manage
            </Link>
          )}
        </div>
        <AppointmentList reservations={upcoming} />
      </section>
    </div>
  );
}
