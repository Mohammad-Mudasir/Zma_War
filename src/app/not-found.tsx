import Link from "next/link";
import { buttonClass } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-start justify-center gap-5 px-6">
      <p className="font-display text-7xl font-bold text-pine-600">404</p>
      <h1 className="text-3xl font-semibold">We can’t find that page</h1>
      <p className="text-muted">The link may be old, or the page may have moved. Let’s get you back to the appointments.</p>
      <div className="flex gap-3">
        <Link href="/appointments" className={buttonClass({ variant: "primary" })}>
          See available times
        </Link>
        <Link href="/" className={buttonClass({ variant: "secondary" })}>
          Go home
        </Link>
      </div>
    </main>
  );
}
