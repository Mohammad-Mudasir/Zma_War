import type { Metadata } from "next";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { requireAdmin } from "@/lib/auth";
import { firstName } from "@/lib/utils";
import { getAdminOverview } from "@/services/reservation.service";

export const metadata: Metadata = { title: "Admin · Today" };

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();
  const data = await getAdminOverview();
  return <AdminDashboard data={data} adminName={firstName(admin.name)} />;
}
