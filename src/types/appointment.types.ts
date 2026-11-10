/** A slot, already formatted for display (safe to pass to client components). */
export type SlotView = {
  id: number;
  startsAt: string; // ISO timestamp
  dateKey: string; // YYYY-MM-DD in the hospital timezone
  dayShort: string; // "Mon 9 Nov"
  dayLong: string; // "Monday 9 November 2026"
  start: string; // "9:00 AM"
  end: string; // "9:30 AM"
  isReserved: boolean;
};

export type DayGroup = {
  dateKey: string;
  heading: string;
  slots: SlotView[];
};

export type AdminSlotView = SlotView & {
  isPast: boolean;
  reservation: { id: number; userName: string; userEmail: string } | null;
};
