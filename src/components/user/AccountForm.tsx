"use client";

import { useActionState } from "react";
import { changePasswordAction, updateProfileAction } from "@/actions/account.actions";
import { FormMessage } from "@/components/ui/FormMessage";
import { Input, Select } from "@/components/ui/Input";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { REMINDER_OPTIONS, reminderLabel } from "@/lib/constants";
import { initialFormState } from "@/types/api.types";
import type { SessionUser } from "@/types/user.types";

export function AccountForm({ user, hospitalDefault }: { user: SessionUser; hospitalDefault: number }) {
  const [profile, profileAction] = useActionState(updateProfileAction, initialFormState);
  const [password, passwordAction] = useActionState(changePasswordAction, initialFormState);
  const pe = profile.fieldErrors ?? {};
  const we = password.fieldErrors ?? {};

  const reminderOptions = [
    { value: "", label: `Hospital default (${reminderLabel(hospitalDefault)} before)` },
    ...REMINDER_OPTIONS,
  ];

  return (
    <div className="space-y-10">
      <form action={profileAction} className="space-y-5 rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <div>
          <h2 className="text-2xl font-semibold">Your details</h2>
          <p className="text-muted">We use these to identify your reservations and to email you.</p>
        </div>
        <FormMessage state={profile} />
        <Input label="Full name" name="name" required autoComplete="name" defaultValue={profile.values?.name ?? user.name} error={pe.name} />
        <Input
          label="Email address"
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={profile.values?.email ?? user.email}
          error={pe.email}
          hint="If you change it, you’ll need to verify the new address."
        />
        <Select
          label="Usual reminder time"
          name="defaultReminderMinutes"
          defaultValue={user.defaultReminderMinutes ?? ""}
          options={reminderOptions}
          error={pe.defaultReminderMinutes}
          hint="Suggested each time you reserve. You can still change it for each appointment."
        />
        <SubmitButton pendingLabel="Saving…">Save changes</SubmitButton>
      </form>

      <form action={passwordAction} className="space-y-5 rounded-3xl border border-line bg-surface p-6 sm:p-8">
        <div>
          <h2 className="text-2xl font-semibold">Change password</h2>
          <p className="text-muted">Pick something you don’t use anywhere else.</p>
        </div>
        <FormMessage state={password} />
        <Input label="Current password" name="currentPassword" type="password" autoComplete="current-password" required error={we.currentPassword} />
        <Input
          label="New password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          error={we.newPassword}
          hint="At least 8 characters, with a letter and a number."
        />
        <Input label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" required error={we.confirmPassword} />
        <SubmitButton variant="secondary" pendingLabel="Changing…">
          Change password
        </SubmitButton>
      </form>
    </div>
  );
}
