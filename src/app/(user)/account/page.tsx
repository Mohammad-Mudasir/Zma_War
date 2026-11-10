import type { Metadata } from "next";
import { AccountForm } from "@/components/user/AccountForm";
import { requireUser } from "@/lib/auth";
import { getDefaultReminderMinutes } from "@/services/reminder.service";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const user = await requireUser();
  const hospitalDefault = await getDefaultReminderMinutes();

  return (
    <div className="max-w-xl space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold sm:text-4xl">Account</h1>
        <p className="text-muted">Keep your details up to date so we can reach you.</p>
      </header>
      <AccountForm user={user} hospitalDefault={hospitalDefault} />
    </div>
  );
}
