import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { SlotTable, type Viewer } from "@/components/user/SlotTable";
import { getCurrentUser } from "@/lib/auth";
import { MAX_ACTIVE_RESERVATIONS } from "@/lib/constants";
import { getUpcomingDays } from "@/services/appointment.service";
import { reminderDefaultFor } from "@/services/reminder.service";
import { countActiveReservations } from "@/services/reservation.service";

export const metadata: Metadata = { title: "Find a time" };

export default async function AppointmentsPage() {
  const user = await getCurrentUser();
  const [days, defaultMinutes, used] = await Promise.all([
    getUpcomingDays(3),
    reminderDefaultFor(user),
    user ? countActiveReservations(user.id) : Promise.resolve(0),
  ]);

  const viewer: Viewer = { signedIn: !!user, verified: !!user?.emailVerified, defaultMinutes };

  return (
    <div className="mx-auto max-w-4xl space-y-10 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold sm:text-5xl">Find a time</h1>
        <p className="max-w-xl text-lg text-muted">The next three days at a glance. Need something further out? Use “Book ahead”.</p>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/appointments/future" className={buttonClass({ variant: "secondary", size: "sm" })}>
            Book ahead
          </Link>
          {!user && <p className="text-sm text-muted">You can browse without an account. We’ll ask you to sign in when you reserve.</p>}
          {user && !user.emailVerified && (
            <p className="text-sm font-medium text-saffron-700">
              Please <Link href="/verify-email" className="underline">verify your email</Link> to reserve.
            </p>
          )}
          {user?.emailVerified && (
            <p className="text-sm text-muted">
              You’re using {used} of {MAX_ACTIVE_RESERVATIONS} reservations.
            </p>
          )}
        </div>
      </header>

      {days.map((day) => {
        const open = day.slots.filter((s) => !s.isReserved).length;
        return (
          <section key={day.dateKey} aria-labelledby={`day-${day.dateKey}`} className="space-y-3">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 id={`day-${day.dateKey}`} className="text-2xl font-semibold">
                {day.heading}
              </h2>
              {day.slots.length > 0 && (
                <p className="text-sm text-muted">
                  {open} of {day.slots.length} open
                </p>
              )}
            </div>
            <SlotTable slots={day.slots} viewer={viewer} returnTo="/appointments" caption={`Appointments for ${day.heading}`} />
          </section>
        );
      })}
    </div>
  );
}
