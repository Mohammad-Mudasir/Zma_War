import Link from "next/link";

export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        fill="#0f6b58"
        d="M10 8h44a4 4 0 0 1 4 4v10a6 6 0 0 0 0 12v18a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V34a6 6 0 0 0 0-12V12a4 4 0 0 1 4-4z"
      />
      <path fill="none" stroke="#e8f3ef" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" d="M22 22h20L22 42h20" />
    </svg>
  );
}

export function Logo({ href = "/", suffix }: { href?: string; suffix?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5" aria-label="Zma Wār home">
      <LogoMark />
      <span className="font-display text-xl font-bold tracking-tight">Zma Wār</span>
      {suffix && <span className="rounded-full bg-saffron-50 px-2 py-0.5 text-sm font-semibold text-saffron-700">{suffix}</span>}
    </Link>
  );
}
