import { cn } from "@/lib/utils";

const tones = {
  available: { cls: "bg-pine-50 text-pine-800", icon: "✓" },
  reserved: { cls: "bg-saffron-50 text-saffron-700", icon: "●" },
  cancelled: { cls: "bg-pomegranate-50 text-pomegranate-700", icon: "✕" },
  neutral: { cls: "bg-line/60 text-muted", icon: "–" },
} as const;

export function Badge({ tone, children }: { tone: keyof typeof tones; children: React.ReactNode }) {
  const t = tones[tone];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold", t.cls)}>
      <span aria-hidden="true" className="text-xs">
        {t.icon}
      </span>
      {children}
    </span>
  );
}
