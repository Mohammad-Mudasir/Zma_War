import type { Metadata } from "next";
import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { controlClass } from "@/components/ui/Input";
import { SlotTable, type Viewer } from "@/components/user/SlotTable";
import { getCurrentUser } from "@/lib/auth";
import { BOOKING_WINDOW_DAYS } from "@/lib/constants";
import { addDaysToKey, dateKeyInTz, dayHeading, isValidDateKey } from "@/lib/time";
import { cn } from "@/lib/utils";
import { getSlotsForDay } from "@/services/appointment.service";
import { reminderDefaultFor } from "@/services/reminder.service";

export const metadata: Metadata = { title: "Book ahead" };

type Props = { searchParams: Promise<{ date?: string | string[] }> };

/** FR-05: a separate option for reserving a slot within the next month. */
export default async function BookAheadPage({ searchParams }: Props) {
  const sp = await searchParams;
  const requested = Array.isArray(sp.date) ? sp.date[0] : sp.date;

  const today = dateKeyInTz(new Date());
  const max = addDaysToKey(today, BOOKING_WINDOW_DAYS);
  const fallback = addDaysToKey(today, 3);
  const valid = !!requested && isValidDateKey(requested) && requested >= today && requested <= max;
  const date = valid ? requested! : fallback;

  const user = await getCurrentUser();
  const [slots, defaultMinutes] = await Promise.all([getSlotsForDay(date), reminderDefaultFor(user)]);
  const viewer: Viewer = { signedIn: !!user, verified: !!user?.emailVerified, defaultMinutes };
  const heading = dayHeading(date, today);

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-10 sm:px-6">
      <header className="space-y-3">
        <h1 className="text-4xl font-semibold sm:text-5xl">Book ahead</h1>
        <p className="max-w-xl text-lg text-muted">Choose any day in the next {BOOKING_WINDOW_DAYS} days to see its open times.</p>
      </header>

      <form method="get" className="flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="date" className="mb-1.5 block text-sm font-semibold">
            Which day?
          </label>
          <input id="date" name="date" type="date" min={today} max={max} defaultValue={date} required className={cn(controlClass, "w-auto")} />
        </div>
        <button type="submit" className={buttonClass({})}>
          Show times
        </button>
        <Link href="/appointments" className={buttonClass({ variant: "ghost" })}>
          Back to the next few days
        </Link>
      </form>

      {requested && !valid && (
        <p role="status" className="rounded-xl bg-saffron-50 px-4 py-3 text-sm font-medium text-saffron-700">
          That date isn’t available to book, so we’re showing {heading.toLowerCase()} instead. Pick a day from today up to {BOOKING_WINDOW_DAYS} days away.
        </p>
      )}

      <section aria-labelledby="day-heading" className="space-y-3">
        <h2 id="day-heading" className="text-2xl font-semibold">
          {heading}
        </h2>
        <SlotTable
          slots={slots}
          viewer={viewer}
          returnTo={`/appointments/future?date=${date}`}
          caption={`Appointments for ${heading}`}
          emptyMessage="No appointments on this day. The hospital may be closed. Try another date."
        />
      </section>
    </div>
  );
}
