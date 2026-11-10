import { Badge } from "@/components/ui/Badge";
import { EmptyRow, Table, Td, Th } from "@/components/ui/Table";
import type { ReservationView } from "@/types/reservation.types";

/** Past and cancelled reservations. */
export function ReservationList({ reservations }: { reservations: ReservationView[] }) {
  return (
    <Table caption="Your past and cancelled reservations">
      <thead>
        <tr>
          <Th>Date</Th>
          <Th>Time</Th>
          <Th>Ticket</Th>
          <Th>Status</Th>
        </tr>
      </thead>
      <tbody>
        {reservations.length === 0 && <EmptyRow colSpan={4}>Your finished and cancelled reservations will appear here.</EmptyRow>}
        {reservations.map((r) => (
          <tr key={r.id}>
            <Td>{r.dayShort}</Td>
            <Td>
              {r.start} – {r.end}
            </Td>
            <Td className="text-muted">#{r.ticketNo}</Td>
            <Td>
              {r.state === "cancelled" ? (
                <Badge tone="cancelled">{r.cancelledBy === "ADMIN" ? "Cancelled by hospital" : "Cancelled"}</Badge>
              ) : (
                <Badge tone="neutral">Completed</Badge>
              )}
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
