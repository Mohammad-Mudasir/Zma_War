import Link from "next/link";
import { HOSPITAL_NAME } from "@/lib/config";
import { Logo } from "@/components/layout/Logo";

/** A calm two-column frame for sign-in and sign-up screens. */
export function AuthShell({ children, aside }: { children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)]">
      <section className="hidden flex-col justify-between bg-pine-800 p-12 text-pine-50 lg:flex">
        <Logo />
        <div className="max-w-md space-y-4">
          {aside ?? (
            <>
              <p className="font-display text-4xl font-semibold leading-tight text-white">
                Your turn is waiting. You don’t have to.
              </p>
              <p className="text-pine-100">
                Pick a time at {HOSPITAL_NAME}, and we’ll remind you before it comes around.
              </p>
            </>
          )}
        </div>
        <p lang="ps" dir="rtl" className="text-2xl text-pine-100">
          زما وار
        </p>
      </section>

      <main className="flex flex-col justify-center px-5 py-10 sm:px-10">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
          <p className="mt-10 text-sm text-muted">
            <Link href="/" className="hover:underline">
              ← Back to Zma Wār
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
