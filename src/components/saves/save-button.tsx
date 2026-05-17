"use client";

import { useState, useTransition } from "react";
import { Bookmark } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SignInSheet } from "@/components/auth/sign-in-sheet";
import { toggleSaveAction } from "@/lib/social/saves-actions";
import { playCue } from "@/lib/audio/ui-sound";
import { cn } from "@/lib/utils";
import type { SavedItemType } from "@/lib/supabase/types";

interface SaveButtonProps {
  itemType: SavedItemType;
  itemKey: string;
  /** Server-resolved initial state. Pass from a Server Component. */
  initialSaved: boolean;
  /** Whether the current viewer is signed in. Drives the guest CTA. */
  signedIn: boolean;
  /** Path to redirect back to after sign-in (same-origin only). */
  nextPath?: string;
  variant?: "outline" | "ghost" | "secondary";
  size?: "sm" | "default";
  className?: string;
}

export function SaveButton({
  itemType,
  itemKey,
  initialSaved,
  signedIn,
  nextPath,
  variant = "outline",
  size = "sm",
  className,
}: SaveButtonProps) {
  const t = useTranslations("Social");
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  function handleClick() {
    // Optimistic flip; revert on error.
    const previous = saved;
    setSaved(!previous);
    startTransition(async () => {
      const result = await toggleSaveAction({ itemType, itemKey });
      if (!result.ok) {
        setSaved(previous);
        if (result.reason === "guest") {
          toast.message(t("signInToSave"));
        } else if (result.reason !== "unconfigured") {
          playCue("error-soft");
          toast.error(t("saveFailed"));
        }
      } else {
        setSaved(result.saved);
        playCue(result.saved ? "save" : "unsave");
      }
    });
  }

  // Guest path: render the SignInSheet around the same affordance so
  // tapping it opens the sign-in dialog instead of attempting a write
  // that will be denied by RLS anyway.
  if (!signedIn) {
    return (
      <SignInSheet
        next={nextPath}
        trigger={
          <Button
            type="button"
            variant={variant}
            size={size}
            aria-label={t("saveAria")}
            className={cn("gap-2", className)}
          >
            <Bookmark className="size-4" aria-hidden="true" />
            <span>{t("save")}</span>
          </Button>
        }
      />
    );
  }

  return (
    <Button
      type="button"
      variant={saved ? "secondary" : variant}
      size={size}
      aria-pressed={saved}
      aria-label={saved ? t("unsaveAria") : t("saveAria")}
      onClick={handleClick}
      disabled={pending}
      className={cn("gap-2", className)}
    >
      <Bookmark
        className={cn("size-4", saved && "fill-current")}
        aria-hidden="true"
      />
      <span>{saved ? t("savedState") : t("save")}</span>
    </Button>
  );
}
