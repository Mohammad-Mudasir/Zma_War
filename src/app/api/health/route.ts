import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// For uptime monitoring and container health checks (NFR-04).
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "database unavailable" }, { status: 503 });
  }
}
