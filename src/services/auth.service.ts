import { prisma } from "@/lib/prisma";
import { APP_URL } from "@/lib/config";
import { VERIFICATION_TTL_HOURS } from "@/lib/constants";
import { sendEmail } from "@/lib/email";
import { ServiceError } from "@/lib/errors";
import { dummyHash, generateToken, hashPassword, sha256, verifyPassword } from "@/lib/password";
import { verificationEmail } from "@/emails/verification-email";
import type { VerifyResult } from "@/types/api.types";

/** Creates a fresh single-use token (replacing any older one) and emails the link. */
export async function sendVerificationEmail(user: { id: number; name: string; email: string }): Promise<boolean> {
  const token = generateToken();
  await prisma.$transaction([
    prisma.emailVerificationToken.deleteMany({ where: { userId: user.id } }),
    prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: sha256(token), // only the hash is stored
        expiresAt: new Date(Date.now() + VERIFICATION_TTL_HOURS * 60 * 60_000),
      },
    }),
  ]);

  const mail = verificationEmail({
    name: user.name,
    url: `${APP_URL}/api/auth/verify-email?token=${token}`,
  });
  const result = await sendEmail({ to: user.email, ...mail });
  return result.ok;
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const existing = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (existing) {
    throw new ServiceError("EMAIL_TAKEN", "An account with this email already exists. Try signing in instead.");
  }

  const user = await prisma.user.create({
    data: { name: input.name, email: input.email, passwordHash: await hashPassword(input.password) },
  });
  const emailSent = await sendVerificationEmail(user);
  return { user, emailSent };
}

export async function verifyEmailToken(token: string | null): Promise<VerifyResult> {
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return "invalid";

  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash: sha256(token) } });
  if (!record) return "invalid";

  if (record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { id: record.id } });
    return "expired";
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { emailVerified: true } }),
    prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } }), // single use
  ]);
  return "success";
}

/** Returns the user if the credentials are right, otherwise null (never says which part was wrong). */
export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  const ok = await verifyPassword(password, user?.passwordHash ?? (await dummyHash()));
  return ok && user ? user : null;
}

export async function loginAdmin(email: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { email } });
  const ok = await verifyPassword(password, admin?.passwordHash ?? (await dummyHash()));
  return ok && admin ? admin : null;
}
