import { z } from "zod";

// Email is normalized (trim + lowercase) so dedupe and token signing are
// canonical. Honeypot + Turnstile mirror the contact form's spam defenses.
export const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  _honeypot: z.string().optional().default(""),
  turnstileToken: z.string().optional().default(""),
});

export type SubscribeInput = z.infer<typeof subscribeSchema>;
