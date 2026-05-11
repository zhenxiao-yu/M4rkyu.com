import { z } from "zod";

/**
 * Single source of truth for /contact form validation.
 *
 * Used by:
 *   - The client form (`_contact-form.tsx`) via
 *     `@hookform/resolvers/zod` for inline error display.
 *   - The server action (`_actions.ts`) for the authoritative parse
 *     before calling Resend — a curl that bypasses the client still
 *     gets the same shape back.
 *
 * Error messages are intentionally string-keyed (not localised here)
 * so the form layer can map them to translated copy via
 * `useTranslations("Contact")`. This keeps the schema dependency-free
 * (no next-intl in shared lib code) while preserving the bilingual UX.
 *
 * The `_honeypot` field must remain empty — bots fill every visible
 * field. The server action treats a non-empty honeypot as silent
 * success (don't tip off the bot that we caught it).
 */
export const inquirySchema = z.object({
  name: z.string().trim().min(1, "nameError").max(120, "nameError"),
  email: z
    .string()
    .trim()
    .min(1, "emailError")
    .email("emailError")
    .max(254, "emailError"),
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

/** Public-safe view of the input, used when echoing the parsed payload
 *  back into the email template or analytics. Strips the honeypot +
 *  turnstile token. */
export type InquiryPayload = Omit<InquiryInput, "_honeypot" | "turnstileToken">;

/** Field names exposed to the form. Anchors the FormField mapping
 *  without stringly-typed `name` props. */
export const inquiryFields = [
  "name",
  "email",
  "projectType",
  "message",
] as const satisfies ReadonlyArray<keyof InquiryPayload>;

export type InquiryFieldName = (typeof inquiryFields)[number];
