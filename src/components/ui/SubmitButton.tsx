"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./Button";
import { Loader } from "./Loader";

type Props = Omit<React.ComponentProps<typeof Button>, "type"> & { pendingLabel?: string };

/** A submit button that disables itself and shows progress while the form is sending. */
export function SubmitButton({ children, pendingLabel, disabled, ...props }: Props) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || disabled} aria-busy={pending} {...props}>
      {pending ? <Loader label={pendingLabel ?? "Working…"} /> : children}
    </Button>
  );
}
