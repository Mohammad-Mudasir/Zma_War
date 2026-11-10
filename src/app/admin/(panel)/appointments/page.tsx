import type { Metadata } from "next";
import { AppointmentManagement } from "@/components/admin/AppointmentManagement";
import { requireAdmin } from "@/lib/auth";
import { dateKeyInTz, dayHeading, isValidDateKey } from "@/lib/time";
import { getAdminSlotsForDay } from "@/services/appointment.service";
import { getDefaultReminderMinutes } from "@/services/reminder.service";
import { listUserEmails } from "@/services/user.service";

export const metadata: Metadata = { title: "Admin · Schedule" };

type Props = { searchParams: Promise<{ date?: string | string[] }> };

export default async function AdminAppointmentsPage({ searchParams }: Props) {
  await requireAdmin();
  const sp = await searchParams;
  const requested = Array.isArray(sp.date) ? sp.date[0] : sp.date;

  const today = dateKeyInTz(new Date());
  const date = requested && isValidDateKey(requested) ? requested : today;

  const [slots, users, defaultMinutes] = await Promise.all([
    getAdminSlotsForDay(date),
    listUserEmails(),
    getDefaultReminderMinutes(),
  ]);

  return <AppointmentManagement dateKey={date} heading={dayHeading(date, today)} slots={slots} users={users} defaultMinutes={defaultMinutes} />;
}
