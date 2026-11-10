import type { Metadata } from "next";
import { AppointmentList } from "@/components/user/AppointmentList";
import { ReservationList } from "@/components/user/ReservationList";
import { requireUser } from "@/lib/auth";
import { listUserHistory, listUserUpcoming } from "@/services/reservation.service";

export const metadata: Metadata = { title: "My reservations" };

export default async function ReservationsPage() {
  const user = await requireUser();
  const [upcoming, history] = await Promise.all([listUserUpcoming(user.id), listUserHistory(user.id)]);

  return (
    <div className="space-y-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold sm:text-4xl">My reservations</h1>
        <p className="text-muted">Change your reminder time or cancel an appointment you can’t make.</p>
      </header>

      <section aria-labelledby="upcoming-heading" className="space-y-4">
        <h2 id="upcoming-heading" className="text-2xl font-semibold">
          Upcoming
        </h2>
        <AppointmentList reservations={upcoming} manage />
      </section>

      <section aria-labelledby="history-heading" className="space-y-4">
        <h2 id="history-heading" className="text-2xl font-semibold">
          History
        </h2>
        <ReservationList reservations={history} />
      </section>
    </div>
  );
}
