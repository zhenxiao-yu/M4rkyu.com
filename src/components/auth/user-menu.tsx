"use client";

import { useEffect, useState } from "react";
import { UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  hasSupabaseAuthCookie,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import { SignInSheet } from "./sign-in-sheet";
import type { Locale } from "@/i18n/routing";

/**
 * Client component. Reads the EXISTING session from the browser Supabase
 * client (the auth mechanism — sign-in sheet, OAuth, server actions,
 * middleware — is unchanged) and renders either the SignInSheet trigger
 * (guest / not-yet-known) or a link to /account with avatar + name.
 *
 * Reading auth client-side means the header no longer forces a
 * per-request `cookies()` read, which is what lets the surrounding
 * content pages render statically / ISR. Tradeoff: signed-in users see
 * the guest trigger for a beat before the session resolves.
 */
interface SessionUser {
  label: string;
  avatarUrl: string | null;
}

export function UserMenu({ locale }: { locale: Locale }) {
  const t = useTranslations("Auth");
  const [user, setUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    // Skip loading Supabase entirely for anonymous visitors. Every sign-in
    // path revalidates + redirects, so UserMenu re-mounts with the cookie
    // present — gating here loses no live update.
    if (!hasSupabaseAuthCookie()) return;

    let active = true;
    let unsubscribe: (() => void) | undefined;

    const apply = (
      authUser: { user_metadata?: Record<string, unknown> } | null,
    ) => {
      if (!active) return;
      if (!authUser) {
        setUser(null);
        return;
      }
      const meta = authUser.user_metadata ?? {};
      const name =
        (meta.display_name as string | undefined) ??
        (meta.full_name as string | undefined) ??
        (meta.name as string | undefined) ??
        (meta.user_name as string | undefined);
      setUser({
        label: name || t("account"),
        avatarUrl: (meta.avatar_url as string | undefined) ?? null,
      });
    };

    // Dynamic import keeps @supabase/supabase-js out of the header's
    // first-load chunk; it loads as a separate chunk only when needed.
    void (async () => {
      const { createSupabaseBrowserClient } = await import(
        "@/lib/supabase/client"
      );
      if (!active) return;
      const supabase = createSupabaseBrowserClient();
      supabase.auth
        .getUser()
        .then(({ data }) => apply(data.user))
        .catch(() => apply(null));
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) =>
        apply(session?.user ?? null),
      );
      unsubscribe = () => sub.subscription.unsubscribe();
    })();

    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [t]);

  if (!user) {
    return <SignInSheet />;
  }

  return (
    <Button asChild variant="ghost" size="sm" className="gap-2">
      <Link href="/account" locale={locale} aria-label={t("openAccount")}>
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- OAuth avatar URLs may not be on the next/image allowlist.
          <img
            src={user.avatarUrl}
            alt=""
            className="size-6 rounded-full border border-border object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <UserRound className="size-4" aria-hidden="true" />
        )}
        <span className="hidden max-w-[14ch] truncate min-[380px]:inline">
          {user.label}
        </span>
      </Link>
    </Button>
  );
}
