import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { processDueReminders } from "@/services/reminder.service";

// An HTTP trigger for the reminder job, for hosts that can't run a background worker.
// Call it every few minutes from a free scheduler such as cron-job.org:
//   GET https://your-site/api/jobs/reminders   with header  Authorization: Bearer <CRON_SECRET>
export const dynamic = "force-dynamic";

function authorised(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret || secret.length < 16) return false; // refuse to run unprotected

  const given = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(secret);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function GET(request: NextRequest) {
  if (!authorised(request)) return NextResponse.json({ error: "Unauthorised" }, { status: 401 });

  try {
    const result = await processDueReminders();
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    console.error("[reminders] run failed:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
