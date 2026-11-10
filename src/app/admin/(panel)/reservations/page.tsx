import type { Metadata } from "next";
import { ReservationManagement } from "@/components/admin/ReservationManagement";
import { requireAdmin } from "@/lib/auth";
import { listReservationsAdmin } from "@/services/reservation.service";
import type { ReservationFilter } from "@/types/reservation.types";

export const metadata: Metadata = { title: "Admin · Reservations" };

type Props = { searchParams: Promise<{ filter?: string; q?: string; page?: string }> };

const FILTERS: ReservationFilter[] = ["upcoming", "past", "cancelled", "all"];

export default async function AdminReservationsPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;

  const filter = FILTERS.includes(sp.filter as ReservationFilter) ? (sp.filter as ReservationFilter) : "upcoming";
  const q = (sp.q ?? "").slice(0, 100);
  const page = Math.max(1, Number.parseInt(sp.page ?? "1", 10) || 1);

  const data = await listReservationsAdmin({ filter, q, page, pageSize: 10 });
  return <ReservationManagement data={data} filter={filter} q={q} />;
}
