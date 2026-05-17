"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/lib/auth/actions";

export function SignOutButton({
  locale,
  variant = "outline",
}: {
  locale: string;
  variant?: "outline" | "ghost" | "default";
}) {
  const t = useTranslations("Auth");
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await signOutAction(locale);
        })
      }
      className="gap-2"
    >
      <LogOut className="size-4" aria-hidden="true" />
      <span>{t("signOut")}</span>
    </Button>
  );
}
