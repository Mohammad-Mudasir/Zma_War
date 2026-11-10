import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { EmptyRow, Table, Td, Th } from "@/components/ui/Table";
import type { getAdminOverview } from "@/services/reservation.service";

type Overview = Awaited<ReturnType<typeof getAdminOverview>>;

export function AdminDashboard({ data, adminName }: { data: Overview; adminName: string }) {
  const open = data.todaySlots - data.todayBooked;

  const facts: Array<{ label: string; value: number; note?: string }> = [
    { label: "Upcoming reservations", value: data.upcoming },
    { label: "Cancelled in the last 7 days", value: data.cancelledWeek },
    { label: "Registered users", value: data.users, note: data.unverified ? `${data.unverified} not yet verified` : undefined },
  ];

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold sm:text-4xl">Today</h1>
        <p className="text-muted">
          {data.todaySlots === 0
            ? `No appointments are scheduled today, ${adminName}.`
            : `${data.todayBooked} of ${data.todaySlots} appointments are booked today. ${open} still open.`}
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section aria-labelledby="today-heading" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 id="today-heading" className="text-2xl font-semibold">
              Today’s schedule
            </h2>
            <Link href="/admin/appointments" className={buttonClass({ variant: "secondary", size: "sm" })}>
              Open full schedule
            </Link>
          </div>
          <Table caption="Reservations for today">
            <thead>
              <tr>
                <Th>Time</Th>
                <Th>Person</Th>
                <Th>Booked by</Th>
              </tr>
            </thead>
            <tbody>
              {data.today.length === 0 && <EmptyRow colSpan={3}>No reservations today.</EmptyRow>}
              {data.today.map((r) => (
                <tr key={r.id}>
                  <Td className="font-semibold">{r.start}</Td>
                  <Td>
                    <p className="font-medium">{r.user.name}</p>
                    <p className="text-sm text-muted">{r.user.email}</p>
                  </Td>
                  <Td>{r.createdByAdmin ? <Badge tone="neutral">Hospital</Badge> : <Badge tone="available">Patient</Badge>}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </section>

        <aside aria-label="At a glance">
          <dl className="divide-y divide-line rounded-2xl border border-line bg-surface">
            {facts.map((f) => (
              <div key={f.label} className="px-5 py-4">
                <dt className="text-sm text-muted">{f.label}</dt>
                <dd className="font-display text-3xl font-semibold">{f.value}</dd>
                {f.note && <p className="text-sm text-muted">{f.note}</p>}
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </div>
  );
}
