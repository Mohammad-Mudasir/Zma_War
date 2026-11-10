import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/AuthShell";
import { LoginForm } from "@/components/auth/LoginForm";
import { getCurrentAdmin } from "@/lib/auth";
import { safeNextPath } from "@/lib/utils";

export const metadata: Metadata = { title: "Staff sign in", robots: { index: false } };

type Props = { searchParams: Promise<{ next?: string | string[] }> };

export default async function AdminLoginPage({ searchParams }: Props) {
  const sp = await searchParams;
  const next = safeNextPath(Array.isArray(sp.next) ? sp.next[0] : sp.next, "/admin/dashboard");
  if (await getCurrentAdmin()) redirect(next.startsWith("/admin") ? next : "/admin/dashboard");

  return (
    <AuthShell
      aside={
        <>
          <p className="font-display text-4xl font-semibold leading-tight text-white">The hospital desk.</p>
          <p className="text-pine-100">Manage reservations, book on someone’s behalf, and set reminder defaults.</p>
        </>
      }
    >
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-semibold">Staff sign in</h1>
          <p className="text-muted">For the hospital administrator only.</p>
        </div>
        <LoginForm admin next={next.startsWith("/admin") ? next : undefined} />
      </div>
    </AuthShell>
  );
}
