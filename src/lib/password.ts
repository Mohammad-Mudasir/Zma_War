import bcrypt from "bcryptjs";
import { createHash, randomBytes } from "node:crypto";

const COST = 12;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, COST);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

let dummy: Promise<string> | null = null;
/** Compared against when no account exists, so login timing doesn't reveal which emails are registered. */
export function dummyHash(): Promise<string> {
  dummy ??= bcrypt.hash("zma-war-timing-guard", COST);
  return dummy;
}

/** 64 hex characters of randomness for email-verification links. */
export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export function sha256(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
