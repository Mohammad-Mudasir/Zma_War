import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";
import { BOOKING_WINDOW_DAYS, MAX_ACTIVE_RESERVATIONS } from "@/lib/constants";
import { HOSPITAL_NAME } from "@/lib/config";
import { getCurrentUser } from "@/lib/auth";
import { getNextAvailableSlot } from "@/services/appointment.service";

const steps = [
  { title: "Create an account", body: "Sign up with your email and confirm it with one tap on the link we send you." },
  { title: "Pick a time that suits you", body: "Browse the open times in a simple table and reserve the one you want." },
  { title: "Get a reminder", body: "We email you before your turn. You choose how early, from 10 minutes to a day." },
];

export default async function HomePage() {
  const [slot, user] = await Promise.all([getNextAvailableSlot(), getCurrentUser()]);
  const [time, period] = slot?.start.split(" ") ?? [];

  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-12 pt-12 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pt-20">
        <div className="space-y-6">
          <h1 className="text-5xl font-bold sm:text-6xl">
            Book your turn.
            <br />
            Skip the waiting room.
          </h1>
          <p className="max-w-lg text-lg text-muted">
            Reserve an appointment at {HOSPITAL_NAME} from your phone, and we’ll remind you before it’s time. No more
            standing in line just to ask for a slot.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/appointments" className={buttonClass({ size: "lg" })}>
              See available times
            </Link>
            {!user && (
              <Link href="/register" className={buttonClass({ variant: "secondary", size: "lg" })}>
                Create an account
              </Link>
            )}
          </div>
        </div>

        {/* The next free slot, drawn as a ticket. */}
        <div className="lg:justify-self-end lg:w-full lg:max-w-md">
          <div className="ticket -rotate-1 shadow-sm">
            <div className="ticket-stub flex flex-col items-center justify-center px-3 py-10 text-center">
              {slot ? (
                <>
                  <p className="font-display text-5xl font-bold leading-none text-pine-800">{time}</p>
                  <p className="mt-1 text-lg font-semibold text-pine-700">{period}</p>
                </>
              ) : (
                <p className="font-display text-3xl font-bold text-pine-800">—</p>
              )}
            </div>
            <div className="flex flex-col justify-between gap-6 p-6">
              <div>
                <p className="text-sm font-semibold text-pine-700">Next free time</p>
                {slot ? (
                  <>
                    <p className="font-display text-2xl font-semibold">{slot.dayLong}</p>
                    <p className="text-muted">
                      {slot.start} to {slot.end}
                    </p>
                  </>
                ) : (
                  <p className="font-display text-2xl font-semibold">No times are open right now</p>
                )}
              </div>
              <Link href="/appointments" className={buttonClass({ variant: slot ? "primary" : "secondary", size: "sm", className: "self-start" })}>
                {slot ? "Reserve a time" : "Check again soon"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6" aria-labelledby="how-heading">
        <h2 id="how-heading" className="mb-8 text-3xl font-semibold">
          How it works
        </h2>
        <ol className="grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-pine-600 font-display text-lg font-bold text-white">
                {i + 1}
              </span>
              <div>
                <h3 className="text-xl font-semibold">{s.title}</h3>
                <p className="mt-1 text-muted">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6" aria-labelledby="rules-heading">
        <div className="rounded-3xl bg-pine-50 p-8 sm:p-10">
          <h2 id="rules-heading" className="text-2xl font-semibold">
            Good to know
          </h2>
          <ul className="mt-4 grid gap-x-10 gap-y-3 text-pine-800 sm:grid-cols-2">
            <li>You can hold up to {MAX_ACTIVE_RESERVATIONS} upcoming reservations at once.</li>
            <li>Book up to {BOOKING_WINDOW_DAYS} days ahead with the “Book ahead” option.</li>
            <li>Can’t make it? Cancel in one tap so someone else can have the time.</li>
            <li>Anyone can look at the times. You sign in only when you reserve.</li>
          </ul>
        </div>
      </section>
    </>
  );
}
