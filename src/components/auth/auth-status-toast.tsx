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

    if (authError) {
      toast.error(t(`callbackError.${classify(authError)}`));
    } else if (accountDeleted) {
      toast.success(t("accountDeletedToast"));
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

// The callback route can produce a small set of `authError` values.
// Anything outside the known set falls back to a generic message
// rather than rendering raw URL noise.
function classify(value: string): "unconfigured" | "exchangeFailed" | "missingCode" | "generic" {
  if (value === "unconfigured") return "unconfigured";
  if (value === "exchangeFailed") return "exchangeFailed";
  if (value === "missingCode") return "missingCode";
  return "generic";
}
