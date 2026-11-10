import type { Metadata } from "next";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { requireAdmin } from "@/lib/auth";
import { getDefaultReminderMinutes } from "@/services/reminder.service";

export const metadata: Metadata = { title: "Admin · Settings" };

export default async function AdminSettingsPage() {
  await requireAdmin();
  const current = await getDefaultReminderMinutes();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold sm:text-4xl">Settings</h1>
        <p className="text-muted">Defaults that apply to everyone.</p>
      </header>
      <SettingsForm current={current} />
    </div>
  );
}
