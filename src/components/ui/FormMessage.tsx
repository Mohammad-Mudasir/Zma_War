import { cn } from "@/lib/utils";
import type { FormState } from "@/types/api.types";

/** Feedback banner for a form's result. Uses text and an icon, not just colour. */
export function FormMessage({ state }: { state: FormState | null }) {
  if (!state || state.status === "idle" || !state.message) return null;
  const ok = state.status === "success";
  return (
    <div
      role={ok ? "status" : "alert"}
      className={cn(
        "flex gap-3 rounded-xl px-4 py-3 text-sm font-medium",
        ok ? "bg-pine-50 text-pine-800" : "bg-pomegranate-50 text-pomegranate-700",
      )}
    >
      <span aria-hidden="true" className="font-bold">
        {ok ? "✓" : "!"}
      </span>
      <span>{state.message}</span>
    </div>
  );
}
