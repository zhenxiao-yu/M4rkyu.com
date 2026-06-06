"use client";

import { createContext, useContext } from "react";

// Carries an admin action's per-field error map (keyed by form field `name`)
// from the <AdminForm> shell down to the individual inputs, which are server-
// rendered as children and so can't receive the runtime result via props.
export const AdminFormErrorsContext = createContext<Record<string, string>>({});

/**
 * Resolve the error for a field. Returns the raw value (which may be a blank
 * marker like " " used to flag a field invalid without inline text — the
 * banner carries the detail in that case). Callers split presentation:
 * `Boolean(value)` → aria-invalid, `value?.trim()` → visible message.
 */
export function useFieldError(name?: string): string | undefined {
  const errors = useContext(AdminFormErrorsContext);
  return name ? errors[name] : undefined;
}
