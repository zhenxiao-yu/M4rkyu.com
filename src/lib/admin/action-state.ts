import { z } from "zod";

// Shared result contract for admin server actions. Actions return one
// of these instead of throwing, so the form UI can show an inline
// error banner / success toast rather than tripping the error boundary
// (a white screen on a duplicate slug is not a "powerful CMS").
export interface AdminActionState {
  status: "idle" | "success" | "error";
  message?: string;
  /** Optional per-field messages keyed by form field name. */
  fieldErrors?: Record<string, string>;
}

export const ADMIN_ACTION_IDLE: AdminActionState = { status: "idle" };

export function adminError(
  message: string,
  fieldErrors?: Record<string, string>,
): AdminActionState {
  return { status: "error", message, fieldErrors };
}

export function adminSuccess(message?: string): AdminActionState {
  return { status: "success", message };
}

// Turn a ZodError into a readable banner message + field map. Keeps the
// first error per field; the banner lists field names so the user knows
// where to look.
export function zodToActionState(error: z.ZodError): AdminActionState {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "form";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  const fields = Object.keys(fieldErrors).filter((k) => k !== "form");
  const message =
    fields.length > 0
      ? `Check these fields: ${fields.join(", ")}.`
      : (fieldErrors.form ?? "Validation failed.");
  return { status: "error", message, fieldErrors };
}

// Map a Supabase/Postgres error to a friendlier message. Unique-violation
// (23505) almost always means a duplicate slug in this CMS.
export function dbErrorToMessage(message: string): string {
  if (/duplicate key|23505|already exists/i.test(message)) {
    return "That slug is already taken — pick a unique one.";
  }
  return message || "Something went wrong saving to the database.";
}
