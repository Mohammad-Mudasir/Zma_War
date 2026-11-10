// Run with: npx prisma db seed
// Creates the single administrator, default settings and upcoming appointment slots.

import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/password";
import { ensureUpcomingSlots } from "../src/services/appointment.service";
import { setDefaultReminderMinutes } from "../src/services/reminder.service";
import { DEFAULT_REMINDER_MINUTES } from "../src/lib/constants";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME?.trim() || "Administrator";

  if (!email || !password) {
    throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before seeding (see the SDD: 12.3 Administrator Identity).");
  }
  if (password.length < 10) throw new Error("ADMIN_PASSWORD should be at least 10 characters.");

  // The SRS describes exactly one administrator, so update the existing one if there is one.
  const passwordHash = await hashPassword(password);
  const existing = await prisma.admin.findFirst();
  if (existing) {
    await prisma.admin.update({ where: { id: existing.id }, data: { name, email, passwordHash } });
  } else {
    await prisma.admin.create({ data: { name, email, passwordHash } });
  }
  console.log(`Administrator ready: ${email}`);

  const current = await prisma.systemSetting.findUnique({ where: { key: "default_reminder_minutes" } });
  if (!current) await setDefaultReminderMinutes(DEFAULT_REMINDER_MINUTES);

  const created = await ensureUpcomingSlots();
  console.log(`Appointment slots created: ${created}`);

  if (process.env.SEED_DEMO === "true") {
    const demoEmail = "demo@zmawar.test";
    await prisma.user.upsert({
      where: { email: demoEmail },
      update: {},
      create: {
        name: "Demo Patient",
        email: demoEmail,
        passwordHash: await hashPassword("Demo12345"),
        emailVerified: true,
      },
    });
    console.log(`Demo user ready: ${demoEmail} / Demo12345`);
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
