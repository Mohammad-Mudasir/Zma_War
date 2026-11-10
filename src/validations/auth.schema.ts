import { z } from "zod";

// bcrypt only uses the first 72 bytes, so we cap passwords there.
export const passwordRule = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(72, "Use 72 characters or fewer")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/\d/, "Include at least one number");

const emailRule = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Enter your email address")
  .max(190, "That email address is too long")
  .email("Enter a valid email address");

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(80, "That name is too long"),
    email: emailRule,
    password: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ["confirmPassword"],
    message: "The passwords don't match",
  });

export const loginSchema = z.object({
  email: emailRule,
  password: z.string().min(1, "Enter your password").max(200),
});

export { emailRule };
