"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  clearLegacyLocalSaves,
  readLegacyLocalSavedSlugs,
} from "@/lib/social/local-saves";
import { importLocalSavesAction } from "@/lib/social/saves-actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Renders nothing visually but, on first mount for a signed-in user
 * with legacy localStorage saves, surfaces a Sonner toast asking
 * whether to import those saves into the account.
 *
 * No-op for guests and for users who have no legacy payload. Mount
 * once in the locale layout — multiple mounts are safe (the toast
 * has a stable id) but unnecessary.
 */
export function LocalSavesMigration() {
  const t = useTranslations("Social");
  const seenRef = useRef(false);
  // Determine sign-in client-side so the layout doesn't need a
  // per-request cookie read (keeps pages statically renderable).
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createSupabaseBrowserClient();
    let active = true;
    supabase.auth
      .getUser()
      .then(({ data }) => {
        if (active) setSignedIn(Boolean(data.user));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!signedIn || seenRef.current) return;
    if (typeof window === "undefined") return;

    const slugs = readLegacyLocalSavedSlugs();
    if (slugs.length === 0) return;

    seenRef.current = true;

    toast.message(t("migrationPromptTitle"), {
      id: "m4-saves-migration",
      description: t("migrationPromptBody", { count: slugs.length }),
      duration: 30_000,
      action: {
        label: t("migrationImport"),
        onClick: async () => {
          const result = await importLocalSavesAction({
            slugs,
            itemType: "gallery",
          });
          if (result.ok) {
            clearLegacyLocalSaves();
            toast.success(t("migrationDone", { count: result.imported }));
          } else {
            toast.error(t("migrationFailed"));
          }
        },
      },
      cancel: {
        label: t("migrationDismiss"),
        onClick: () => {
          clearLegacyLocalSaves();
        },
      },
    });
  }, [signedIn, t]);

  return null;
}
