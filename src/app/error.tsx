"use client";

import { Button } from "@/components/ui/Button";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-start justify-center gap-5 px-6">
      <h1 className="text-3xl font-semibold">Something went wrong</h1>
      <p className="text-muted">
        It’s us, not you. Nothing you did caused this. Try again, and if it keeps happening, come back in a few minutes.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
