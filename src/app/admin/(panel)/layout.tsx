import { adminLogoutAction } from "@/actions/admin.actions";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Logo } from "@/components/layout/Logo";
import { buttonClass } from "@/components/ui/Button";
import { requireAdmin } from "@/lib/auth";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin(); // rejects ordinary users and signed-out visitors (FR-07)

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo href="/admin/dashboard" suffix="Admin" />
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted sm:inline">{admin.name}</span>
            <form action={adminLogoutAction}>
              <button type="submit" className={buttonClass({ variant: "secondary", size: "sm" })}>
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 sm:px-6 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-10">
        <aside>
          <AdminSidebar />
        </aside>
        <main id="content" className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
