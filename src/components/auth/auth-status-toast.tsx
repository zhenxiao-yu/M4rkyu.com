"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

/**
 * Headless island that surfaces auth-callback outcomes the user
 * landed with in the URL — `?authError=...` from a failed OAuth /
 * magic-link round-trip, or `?accountDeleted=1` after a successful
 * account-deletion bounce.
 *
 * After the toast fires we replace the URL with the same path minus
 * the param so a refresh doesn't re-fire the notification.
 *
 * Mounted once in the locale layout. Renders nothing.
 */
export function AuthStatusToast() {
  const t = useTranslations("Auth");
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const authError = params.get("authError");
    const accountDeleted = params.get("accountDeleted");
    if (!authError && !accountDeleted) return;

    // Stable ids → a repeat call (StrictMode double-invoke in dev, or
    // the re-run triggered when router.replace below changes `params`)
    // updates the same toast instead of stacking a duplicate.
    if (authError) {
      toast.error(t(`callbackError.${classify(authError)}`), {
        id: "auth-callback-error",
      });
    } else if (accountDeleted) {
      toast.success(t("accountDeletedToast"), {
        id: "auth-account-deleted",
      });
    }

    // Strip the signal params from the URL so a refresh doesn't
    // replay the toast. Preserve any other params already on the URL.
    const next = new URLSearchParams(params.toString());
    next.delete("authError");
    next.delete("accountDeleted");
    const query = next.toString();
    router.replace(
      query
        ? `${window.location.pathname}?${query}`
        : window.location.pathname,
      { scroll: false },
    );
  }, [params, router, t]);

  return null;
}

// The callback route normalises raw Supabase error codes into this
// small set. Anything else falls back to `generic` rather than
// rendering machine-y URL noise.
type CallbackErrorKey =
  | "unconfigured"
  | "exchangeFailed"
  | "missingCode"
  | "otpExpired"
  | "accessDenied"
  | "rateLimited"
  | "duplicateIdentity"
  | "serverError"
  | "generic";

function classify(value: string): CallbackErrorKey {
  switch (value) {
    case "unconfigured":
    case "exchangeFailed":
    case "missingCode":
    case "otpExpired":
    case "accessDenied":
    case "rateLimited":
    case "duplicateIdentity":
    case "serverError":
      return value;
    default:
      return "generic";
  }
}
