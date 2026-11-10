import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/errors";
import { hashPassword, verifyPassword } from "@/lib/password";
import { sendVerificationEmail } from "./auth.service";

export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

/** Updates name, email and reminder preference. A changed email must be verified again. */
export async function updateProfile(
  userId: number,
  input: { name: string; email: string; defaultReminderMinutes: number | null },
): Promise<{ emailChanged: boolean; emailSent: boolean }> {
  const current = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const emailChanged = input.email !== current.email;

  if (emailChanged) {
    const taken = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
    if (taken) throw new ServiceError("EMAIL_TAKEN", "Another account already uses this email address.");
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      email: input.email,
      defaultReminderMinutes: input.defaultReminderMinutes,
      ...(emailChanged ? { emailVerified: false } : {}),
    },
  });

  const emailSent = emailChanged ? await sendVerificationEmail(updated) : true;
  return { emailChanged, emailSent };
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!(await verifyPassword(currentPassword, user.passwordHash))) {
    throw new ServiceError("WRONG_PASSWORD", "Your current password isn't correct.");
  }
  await prisma.user.update({ where: { id: userId }, data: { passwordHash: await hashPassword(newPassword) } });
}

/** Email addresses for the admin's "reserve for a user" suggestions. */
export function listUserEmails(limit = 200) {
  return prisma.user.findMany({
    select: { name: true, email: true },
    orderBy: { name: "asc" },
    take: limit,
  });
}
