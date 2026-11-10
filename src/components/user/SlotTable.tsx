import { Badge } from "@/components/ui/Badge";
import { EmptyRow, Table, Td, Th } from "@/components/ui/Table";
import type { SlotView } from "@/types/appointment.types";
import { ReserveButton } from "./ReserveButton";

export type Viewer = {
  signedIn: boolean;
  verified: boolean;
  defaultMinutes: number;
};

type Props = {
  slots: SlotView[];
  viewer: Viewer;
  returnTo: string;
  caption: string;
  emptyMessage?: string;
};

/** FR-01: slots in a table, each marked available or reserved with words, not just colour. */
export function SlotTable({ slots, viewer, returnTo, caption, emptyMessage }: Props) {
  return (
    <Table caption={caption}>
      <thead>
        <tr>
          <Th>Time</Th>
          <Th>Status</Th>
          <Th className="text-right">
            <span className="sr-only">Action</span>
          </Th>
        </tr>
      </thead>
      <tbody>
        {slots.length === 0 && <EmptyRow colSpan={3}>{emptyMessage ?? "No appointments are scheduled for this day."}</EmptyRow>}
        {slots.map((slot) => (
          <tr key={slot.id}>
            <Td>
              <span className="font-display text-lg font-semibold">{slot.start}</span>
              <span className="text-muted"> to {slot.end}</span>
            </Td>
            <Td>{slot.isReserved ? <Badge tone="reserved">Reserved</Badge> : <Badge tone="available">Available</Badge>}</Td>
            <Td className="text-right">
              {!slot.isReserved && (
                <ReserveButton
                  slotId={slot.id}
                  slotLabel={`${slot.dayLong}, ${slot.start} – ${slot.end}`}
                  defaultMinutes={viewer.defaultMinutes}
                  signedIn={viewer.signedIn}
                  verified={viewer.verified}
                  returnTo={returnTo}
                />
              )}
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
