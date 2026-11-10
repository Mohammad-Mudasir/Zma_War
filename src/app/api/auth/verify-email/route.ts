import { NextResponse, type NextRequest } from "next/server";
import { APP_URL } from "@/lib/config";
import { verifyEmailToken } from "@/services/auth.service";

// The link in the verification email lands here (FR-04). We check the token,
// then send the person to a friendly page with the result.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  let status: "success" | "invalid" | "expired";
  try {
    status = await verifyEmailToken(token);
  } catch (err) {
    console.error("[verify-email]", err);
    status = "invalid";
  }

  return NextResponse.redirect(new URL(`/verify-email?status=${status}`, APP_URL));
}
