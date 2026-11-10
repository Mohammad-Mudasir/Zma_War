export type ReservationState = "upcoming" | "completed" | "cancelled";

export type ReservationView = {
  id: number;
  ticketNo: string;
  state: ReservationState;
  slotId: number;
  startsAt: string;
  dayShort: string;
  dayLong: string;
  start: string;
  end: string;
  reminderLeadMinutes: number;
  reminderSent: boolean;
  createdByAdmin: boolean;
  cancelledBy: "USER" | "ADMIN" | null;
  user: { id: number; name: string; email: string };
};

export type ReservationFilter = "upcoming" | "past" | "cancelled" | "all";

export type Paged<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};
