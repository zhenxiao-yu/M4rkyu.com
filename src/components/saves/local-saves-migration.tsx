"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  clearLegacyLocalSaves,
  readLegacyLocalSavedSlugs,
} from "@/lib/social/local-saves";
import { importLocalSavesAction } from "@/lib/social/saves-actions";

/**
 * Renders nothing visually but, on first mount for a signed-in user
 * with legacy localStorage saves, surfaces a Sonner toast asking
 * whether to import those saves into the account.
 *
 * No-op for guests and for users who have no legacy payload. Mount
 * once in the locale layout — multiple mounts are safe (the toast
 * has a stable id) but unnecessary.
 */
export function LocalSavesMigration({ signedIn }: { signedIn: boolean }) {
  const t = useTranslations("Social");
  const seenRef = useRef(false);

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
