import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/validations/auth.schema";
import { profileSchema } from "@/validations/account.schema";
import { reserveSchema } from "@/validations/reservation.schema";
import { safeNextPath } from "@/lib/utils";

const valid = { name: "Zarmina Khan", email: "  ZARMINA@Example.com ", password: "Secret123", confirmPassword: "Secret123" };

describe("registerSchema", () => {
  it("normalises the email", () => {
    const r = registerSchema.safeParse(valid);
    expect(r.success && r.data.email).toBe("zarmina@example.com");
  });

  it("rejects weak passwords", () => {
    expect(registerSchema.safeParse({ ...valid, password: "short1", confirmPassword: "short1" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, password: "onlyletters", confirmPassword: "onlyletters" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...valid, password: "12345678", confirmPassword: "12345678" }).success).toBe(false);
  });

  it("rejects mismatched passwords", () => {
    const r = registerSchema.safeParse({ ...valid, confirmPassword: "Different1" });
    expect(r.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("requires a password", () => {
    expect(loginSchema.safeParse({ email: "a@b.co", password: "" }).success).toBe(false);
  });
});

describe("reserveSchema", () => {
  it("accepts only the listed reminder times", () => {
    expect(reserveSchema.safeParse({ appointmentId: "4", reminderLeadMinutes: "30" }).success).toBe(true);
    expect(reserveSchema.safeParse({ appointmentId: "4", reminderLeadMinutes: "45" }).success).toBe(false);
    expect(reserveSchema.safeParse({ appointmentId: "-1", reminderLeadMinutes: "30" }).success).toBe(false);
  });
});

describe("profileSchema", () => {
  it("treats an empty reminder preference as 'use the hospital default'", () => {
    const r = profileSchema.safeParse({ name: "Ali Khan", email: "ali@example.com", defaultReminderMinutes: "" });
    expect(r.success && r.data.defaultReminderMinutes).toBeNull();
  });
});

describe("safeNextPath", () => {
  it("blocks open redirects", () => {
    expect(safeNextPath("https://evil.example")).toBe("/dashboard");
    expect(safeNextPath("//evil.example")).toBe("/dashboard");
    expect(safeNextPath("/appointments")).toBe("/appointments");
  });
});
