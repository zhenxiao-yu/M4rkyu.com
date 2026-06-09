import { z } from "zod";

export const emailSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  next: z.string().optional(),
});

export const otpSchema = emailSchema.extend({
  token: z
    .string()
    .trim()
    .regex(/^\d{6,8}$/),
});

// Reject >72 bytes — bcrypt truncates, which would let a longer password auth via prefix match.
export const passwordSchema = z
  .string()
  .min(8, "passwordTooShort")
  .max(72, "passwordTooLong");

export const credentialSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: passwordSchema,
  next: z.string().optional(),
});
