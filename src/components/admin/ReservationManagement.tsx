import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { buttonClass } from "@/components/ui/Button";
import { controlClass } from "@/components/ui/Input";
import { Pagination } from "@/components/ui/Pagination";
import { EmptyRow, Table, Td, Th } from "@/components/ui/Table";
import { CancelButton } from "@/components/user/CancelButton";
import { reminderLabel } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { Paged, ReservationFilter, ReservationView } from "@/types/reservation.types";

const filters: Array<{ value: ReservationFilter; label: string }> = [
  { value: "upcoming", label: "Upcoming" },
  { value: "past", label: "Past" },
  { value: "cancelled", label: "Cancelled" },
  { value: "all", label: "All" },
];

export function ReservationManagement({ data, filter, q }: { data: Paged<ReservationView>; filter: ReservationFilter; q: string }) {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-semibold sm:text-4xl">Reservations</h1>
          <p className="text-muted">{data.total} {data.total === 1 ? "reservation" : "reservations"} match.</p>
        </div>
        <Link href="/admin/appointments" className={buttonClass({ size: "sm" })}>
          Book for a user
        </Link>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Filter reservations" className="flex flex-wrap gap-1">
          {filters.map((f) => (
            <Link
              key={f.value}
              href={`/admin/reservations?filter=${f.value}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              aria-current={f.value === filter ? "page" : undefined}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-semibold",
                f.value === filter ? "bg-pine-600 text-white" : "hover:bg-pine-50",
              )}
            >
              {f.label}
            </Link>
          ))}
        </nav>
        <form method="get" role="search" className="flex items-center gap-2">
          <input type="hidden" name="filter" value={filter} />
          <label htmlFor="q" className="sr-only">
            Search by name or email
          </label>
          <input id="q" name="q" type="search" defaultValue={q} placeholder="Search name or email" className={cn(controlClass, "h-9 w-56 text-sm")} />
          <button type="submit" className={buttonClass({ variant: "secondary", size: "sm" })}>
            Search
          </button>
        </form>
      </div>

      <Table caption="Reservations">
        <thead>
          <tr>
            <Th>Ticket</Th>
            <Th>Person</Th>
            <Th>When</Th>
            <Th>Reminder</Th>
            <Th>Status</Th>
            <Th className="text-right">
              <span className="sr-only">Actions</span>
            </Th>
          </tr>
        </thead>
        <tbody>
          {data.items.length === 0 && <EmptyRow colSpan={6}>No reservations found.</EmptyRow>}
          {data.items.map((r) => (
            <tr key={r.id}>
              <Td className="text-muted">#{r.ticketNo}</Td>
              <Td>
                <p className="font-medium">{r.user.name}</p>
                <p className="text-sm text-muted">{r.user.email}</p>
              </Td>
              <Td>
                <p className="font-medium">{r.dayShort}</p>
                <p className="text-sm text-muted">
                  {r.start} – {r.end}
                </p>
              </Td>
              <Td className="text-sm">{r.reminderSent ? "Sent" : `${reminderLabel(r.reminderLeadMinutes)} before`}</Td>
              <Td>
                {r.state === "upcoming" && <Badge tone="reserved">Upcoming</Badge>}
                {r.state === "completed" && <Badge tone="neutral">Completed</Badge>}
                {r.state === "cancelled" && <Badge tone="cancelled">{r.cancelledBy === "ADMIN" ? "Cancelled by hospital" : "Cancelled"}</Badge>}
              </Td>
              <Td className="text-right">
                {r.state === "upcoming" && (
                  <CancelButton reservationId={r.id} when={`${r.dayShort}, ${r.start}`} adminFor={r.user.name} label="Cancel" />
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Pagination page={data.page} totalPages={data.totalPages} basePath="/admin/reservations" params={{ filter, q: q || undefined }} />
    </div>
  );
}
