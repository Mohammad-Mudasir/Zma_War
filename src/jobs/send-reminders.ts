// Reminder worker (SDD 3.1 / 10.1).
//
//   npm run job:reminders            keeps running, checking every minute
//   npm run job:reminders -- --once  checks one time and exits (handy for cron)
//
// Run it as its own process or container next to the web app.

import "dotenv/config";
import { prisma } from "@/lib/prisma";
import { ensureUpcomingSlots } from "@/services/appointment.service";
import { processDueReminders } from "@/services/reminder.service";

const once = process.argv.includes("--once");
const intervalMs = Math.max(10, Number(process.env.REMINDER_INTERVAL_SECONDS ?? 60)) * 1000;
const HOUR = 60 * 60_000;

let stopping = false;
let lastSlotTopUp = 0;

async function tick(): Promise<void> {
  try {
    const { sent, failed } = await processDueReminders();
    if (sent || failed) console.log(`[reminders] ${new Date().toISOString()} sent=${sent} failed=${failed}`);

    if (Date.now() - lastSlotTopUp >= HOUR) {
      const created = await ensureUpcomingSlots();
      lastSlotTopUp = Date.now();
      if (created) console.log(`[slots] created ${created} new slots`);
    }
  } catch (err) {
    // Log and carry on: a database hiccup shouldn't stop future reminders.
    console.error("[reminders] run failed:", err);
  }
}

async function main(): Promise<void> {
  if (once) {
    await tick();
    await prisma.$disconnect();
    return;
  }

  console.log(`[reminders] worker started, checking every ${intervalMs / 1000}s`);
  const stop = () => {
    stopping = true;
  };
  process.on("SIGTERM", stop);
  process.on("SIGINT", stop);

  while (!stopping) {
    await tick();
    // Sleep in short steps so shutdown signals are handled promptly.
    for (let waited = 0; waited < intervalMs && !stopping; waited += 500) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  await prisma.$disconnect();
  console.log("[reminders] worker stopped");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
