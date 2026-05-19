import { z } from "zod";

// Single source of truth for /contact validation (client + server). Error strings are i18n keys resolved by the form layer.
// `_honeypot` must stay empty — bots fill everything; non-empty triggers silent success in the action.
export const inquirySchema = z.object({
  name: z.string().trim().min(1, "nameError").max(120, "nameError"),
  // No CR/LF — defense in depth against header injection when echoed into `replyTo` / subjects.
  email: z
    .string()
    .trim()
    .min(1, "emailError")
    .email("emailError")
    .max(254, "emailError")
    .regex(/^[^\r\n]+$/, "emailError"),
  projectType: z
    .string()
    .trim()
    .min(1, "projectTypeError")
    .max(120, "projectTypeError"),
  message: z
    .string()
    .trim()
    .min(20, "messageError")
    .max(4000, "messageError"),
  _honeypot: z.string().max(0).optional().or(z.literal("")),
  turnstileToken: z.string().optional(),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

// Public-safe payload — strips honeypot + turnstile token before reuse in emails/analytics.
export type InquiryPayload = Omit<InquiryInput, "_honeypot" | "turnstileToken">;

// Field names exposed to the form — anchors FormField mapping without stringly-typed props.
export const inquiryFields = [
  "name",
  "email",
  "projectType",
  "message",
] as const satisfies ReadonlyArray<keyof InquiryPayload>;

export type InquiryFieldName = (typeof inquiryFields)[number];
