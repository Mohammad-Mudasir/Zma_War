import type { Metadata } from "next";
import Link from "next/link";
import { UserDashboard } from "@/components/user/UserDashboard";
import { requireUser } from "@/lib/auth";
import { hourInTz } from "@/lib/time";
import { firstName } from "@/lib/utils";
import { listUserUpcoming } from "@/services/reservation.service";

export const metadata: Metadata = { title: "Your turns" };

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const user = await requireUser();
  const upcoming = await listUserUpcoming(user.id);

  return (
    <div className="space-y-6">
      {!user.emailVerified && (
        <div role="status" className="rounded-2xl bg-saffron-50 px-5 py-4 text-saffron-700">
          <p className="font-semibold">Please verify your email address</p>
          <p className="text-sm">
            You need to do this before you can reserve a time.{" "}
            <Link href="/verify-email" className="font-semibold underline">
              Get the link
            </Link>
          </p>
        </div>
      )}
      <UserDashboard upcoming={upcoming} name={firstName(user.name)} greeting={greetingFor(hourInTz(new Date()))} />
    </div>
  );
}
