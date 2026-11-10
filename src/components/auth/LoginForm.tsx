"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction } from "@/actions/auth.actions";
import { adminLoginAction } from "@/actions/admin.actions";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { initialFormState } from "@/types/api.types";

export function LoginForm({ next, admin = false }: { next?: string; admin?: boolean }) {
  const [state, action] = useActionState(admin ? adminLoginAction : loginAction, initialFormState);
  const errors = state.fieldErrors ?? {};

  return (
    <form action={action} className="space-y-5">
      {next && <input type="hidden" name="next" value={next} />}
      <FormMessage state={state} />
      <Input
        label="Email address"
        name="email"
        type="email"
        autoComplete="email"
        required
        defaultValue={state.values?.email}
        error={errors.email}
      />
      <Input
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        error={errors.password}
      />
      <SubmitButton className="w-full" pendingLabel="Signing in…">
        Sign in
      </SubmitButton>
      {!admin && (
        <p className="text-center text-sm text-muted">
          New here?{" "}
          <Link href="/register" className="font-semibold text-pine-700 underline">
            Create an account
          </Link>
        </p>
      )}
    </form>
  );
}
