import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { prisma } from "./prisma";
import { SESSION_COOKIE } from "./constants";
import type { SessionUser, SessionAdmin } from "@/types/user.types";

type Role = "user" | "admin";
type Session = { id: number; role: Role; name: string };

const USER_MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const ADMIN_MAX_AGE = 60 * 60 * 8; // 8 hours

function secretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SECRET must be set to a random string of at least 32 characters.");
  }
  return new TextEncoder().encode(secret);
}

function useSecureCookie(): boolean {
  if (process.env.COOKIE_SECURE) return process.env.COOKIE_SECURE === "true";
  return process.env.NODE_ENV === "production";
}

/** Issues a brand-new session token, so a session id is never reused across logins. */
export async function createSession(input: { id: number; role: Role; name: string }): Promise<void> {
  const maxAge = input.role === "admin" ? ADMIN_MAX_AGE : USER_MAX_AGE;
  const token = await new SignJWT({ role: input.role, name: input.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(input.id))
    .setIssuedAt()
    .setExpirationTime(`${maxAge}s`)
    .sign(secretKey());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: useSecureCookie(),
    path: "/",
    maxAge,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

async function readSession(): Promise<Session | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    const id = Number(payload.sub);
    const role = payload.role;
    if (!Number.isInteger(id) || (role !== "user" && role !== "admin")) return null;
    return { id, role, name: String(payload.name ?? "") };
  } catch {
    return null;
  }
}

/** The signed-in user (looked up fresh from the database), or null. */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  const session = await readSession();
  if (!session || session.role !== "user") return null;
  return prisma.user.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true, emailVerified: true, defaultReminderMinutes: true },
  });
});

export const getCurrentAdmin = cache(async (): Promise<SessionAdmin | null> => {
  const session = await readSession();
  if (!session || session.role !== "admin") return null;
  return prisma.admin.findUnique({
    where: { id: session.id },
    select: { id: true, name: true, email: true },
  });
});

/** For pages and actions that need a signed-in user. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (user) return user;
  if (await getCurrentAdmin()) redirect("/admin/dashboard");
  redirect("/login");
}

/** Server-side authorization for every administrative page and action (SDD 8). */
export async function requireAdmin(): Promise<SessionAdmin> {
  const admin = await getCurrentAdmin();
  if (admin) return admin;
  redirect("/admin/login");
}
