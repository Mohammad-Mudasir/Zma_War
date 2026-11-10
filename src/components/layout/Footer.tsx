import Link from "next/link";
import { HOSPITAL_NAME } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-muted sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div className="space-y-1.5">
          <p className="font-display text-lg font-semibold text-ink">
            Zma Wār <span lang="ps" dir="rtl" className="ms-1 text-pine-700">زما وار</span>
          </p>
          <p>“My turn” in Pashto.</p>
          <p>
            Appointments at {HOSPITAL_NAME}, a fictional hospital. Zma Wār is a learning project.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/appointments" className="hover:text-ink hover:underline">
            Find a time
          </Link>
          <Link href="/appointments/future" className="hover:text-ink hover:underline">
            Book ahead
          </Link>
          <Link href="/login" className="hover:text-ink hover:underline">
            Sign in
          </Link>
          <Link href="/admin/login" className="hover:text-ink hover:underline">
            Staff sign in
          </Link>
        </nav>
      </div>
    </footer>
  );
}
