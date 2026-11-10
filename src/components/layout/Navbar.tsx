import Link from "next/link";
import { logoutAction } from "@/actions/auth.actions";
import { getCurrentAdmin, getCurrentUser } from "@/lib/auth";
import { firstName } from "@/lib/utils";
import { buttonClass } from "@/components/ui/Button";
import { Logo } from "./Logo";

const links = [
  { href: "/appointments", label: "Find a time" },
  { href: "/appointments/future", label: "Book ahead" },
];

export async function Navbar() {
  const [user, admin] = await Promise.all([getCurrentUser(), getCurrentAdmin()]);

  const account = user ? (
    <>
      <Link href="/dashboard" className={buttonClass({ variant: "ghost", size: "sm" })}>
        My turns
      </Link>
      <form action={logoutAction}>
        <button type="submit" className={buttonClass({ variant: "secondary", size: "sm" })}>
          Sign out
        </button>
      </form>
    </>
  ) : admin ? (
    <Link href="/admin/dashboard" className={buttonClass({ variant: "primary", size: "sm" })}>
      Admin panel
    </Link>
  ) : (
    <>
      <Link href="/login" className={buttonClass({ variant: "ghost", size: "sm" })}>
        Sign in
      </Link>
      <Link href="/register" className={buttonClass({ variant: "primary", size: "sm" })}>
        Create account
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Logo />

        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-full px-4 py-2 font-medium hover:bg-pine-50">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user && <span className="mr-1 text-sm text-muted">Hi, {firstName(user.name)}</span>}
          {account}
        </div>

        {/* Mobile menu: a plain <details>, so it works without any JavaScript. */}
        <details className="relative md:hidden">
          <summary className="flex size-11 cursor-pointer list-none items-center justify-center rounded-full border border-line bg-surface [&::-webkit-details-marker]:hidden">
            <span className="sr-only">Menu</span>
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </summary>
          <div className="absolute right-0 mt-2 w-64 space-y-1 rounded-2xl border border-line bg-surface p-3 shadow-lg">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="block rounded-xl px-3 py-2.5 font-medium hover:bg-pine-50">
                {l.label}
              </Link>
            ))}
            <div className="flex flex-wrap items-center gap-2 border-t border-line pt-3">{account}</div>
          </div>
        </details>
      </div>
    </header>
  );
}
