import { VERIFICATION_TTL_HOURS } from "@/lib/constants";
import { emailLayout, type EmailContent } from "./layout";

export function verificationEmail(input: { name: string; url: string }): EmailContent {
  const html = emailLayout({
    preview: "Confirm your email address to start booking.",
    heading: `Welcome, ${input.name}`,
    bodyHtml: `<p style="margin:0 0 12px">Please confirm that this is your email address so you can reserve appointments.</p>
<p style="margin:0;color:#5a6b65">This link works once and expires in ${VERIFICATION_TTL_HOURS} hours. If you didn't create an account, you can ignore this email.</p>`,
    button: { label: "Verify my email", url: input.url },
  });

  const text = `Welcome, ${input.name}.

Confirm your email address to start booking:
${input.url}

The link works once and expires in ${VERIFICATION_TTL_HOURS} hours. If you didn't create an account, ignore this email.`;

  return { subject: "Confirm your email for Zma Wār", html, text };
}
