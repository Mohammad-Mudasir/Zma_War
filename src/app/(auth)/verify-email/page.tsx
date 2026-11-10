import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { EmailVerification } from "@/components/auth/EmailVerification";
import { buttonClass } from "@/components/ui/Button";
import { getCurrentUser } from "@/lib/auth";
import { VERIFICATION_TTL_HOURS } from "@/lib/constants";

export const metadata: Metadata = { title: "Verify your email" };

type Props = { searchParams: Promise<{ status?: string; sent?: string }> };

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { status, sent } = await searchParams;
  const user = await getCurrentUser();

  if (status === "success") {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-semibold">Email verified</h1>
        <p className="text-muted">Thank you. You can now reserve appointment times.</p>
        <Link href="/appointments" className={buttonClass({})}>
          Find a time
        </Link>
      </div>
    );
  }

  if (status === "invalid" || status === "expired") {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-semibold">{status === "expired" ? "That link has expired" : "That link didn’t work"}</h1>
        <p className="text-muted">
          {status === "expired"
            ? `Verification links last ${VERIFICATION_TTL_HOURS} hours.`
            : "It may have been used already, or copied incompletely. If you’ve already verified, just sign in."}
        </p>
        {user ? (
          <EmailVerification />
        ) : (
          <Link href="/login" className={buttonClass({})}>
            Sign in to get a new link
          </Link>
        )}
      </div>
    );
  }

  if (!user) redirect("/login?next=/verify-email");

  if (user.emailVerified) {
    return (
      <div className="space-y-6">
        <h1 className="text-4xl font-semibold">You’re all set</h1>
        <p className="text-muted">Your email address is already verified.</p>
        <Link href="/appointments" className={buttonClass({})}>
          Find a time
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-4xl font-semibold">{sent === "0" ? "Let’s try that email again" : "Check your inbox"}</h1>
      <p className="text-muted">
        {sent === "0" ? (
          <>We couldn’t send the verification email to <strong>{user.email}</strong> just now.</>
        ) : (
          <>We sent a link to <strong>{user.email}</strong>. Open it to confirm your address. It works once and expires in {VERIFICATION_TTL_HOURS} hours.</>
        )}
      </p>
      <p className="text-sm text-muted">Can’t see it? Check your spam folder, or ask for a new link.</p>
      <EmailVerification />
    </div>
  );
}
