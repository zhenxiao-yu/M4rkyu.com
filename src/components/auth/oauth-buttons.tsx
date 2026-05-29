"use client";

import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { resolveSiteOrigin } from "@/lib/auth/redirect-url";
import { authProviderFlags } from "@/lib/auth/provider-flags";

type Provider = "google" | "github" | "discord";

interface OAuthButtonsProps {
  /** Path to bounce back to after the OAuth round-trip. Same-origin only. */
  next?: string;
}

export function OAuthButtons({ next }: OAuthButtonsProps) {
  const [pending, setPending] = useState<Provider | null>(null);
  /**
   * Per-provider error so a failed Google attempt doesn't visually
   * disable the GitHub button (or vice versa). Aligns with product
   * review feedback — the user should always see the path that's
   * still available.
   */
  const [errorOn, setErrorOn] = useState<Provider | null>(null);
  const t = useTranslations("Auth");
  const {
    google: googleEnabled,
    github: githubEnabled,
    discord: discordEnabled,
  } = authProviderFlags();

  async function handleProvider(provider: Provider) {
    setErrorOn(null);
    setPending(provider);
    try {
      // Dynamic import keeps @supabase/supabase-js out of the sign-in
      // sheet's chunk (which rides in the header on every page). It loads
      // only when a provider button is actually clicked.
      const { createSupabaseBrowserClient } = await import(
        "@/lib/supabase/client"
      );
      const supabase = createSupabaseBrowserClient();
      const origin = resolveSiteOrigin(
        typeof window !== "undefined" ? window.location.origin : null,
      );
      const nextParam = next ? `?next=${encodeURIComponent(next)}` : "";
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${origin}/auth/callback${nextParam}` },
      });
      if (oauthError) {
        setErrorOn(provider);
        setPending(null);
      }
      // On success the browser is redirected by Supabase; nothing
      // else to do here.
    } catch {
      setErrorOn(provider);
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      {/*
       * Order: GitHub first. This site's audience is mostly
       * developers / designers — GitHub is the identity-aligned
       * provider for them, and putting it first signals the
       * "for makers" framing without prose.
       */}
      {githubEnabled ? (
        <ProviderButton
          provider="github"
          label={t("continueWithGithub")}
          pending={pending}
          errorOn={errorOn}
          onClick={handleProvider}
        >
          <GithubGlyph className="size-4" aria-hidden="true" />
        </ProviderButton>
      ) : null}
      {googleEnabled ? (
        <ProviderButton
          provider="google"
          label={t("continueWithGoogle")}
          pending={pending}
          errorOn={errorOn}
          onClick={handleProvider}
        >
          <GoogleGlyph className="size-4" aria-hidden="true" />
        </ProviderButton>
      ) : null}
      {discordEnabled ? (
        <ProviderButton
          provider="discord"
          label={t("continueWithDiscord")}
          pending={pending}
          errorOn={errorOn}
          onClick={handleProvider}
        >
          <DiscordGlyph className="size-4" aria-hidden="true" />
        </ProviderButton>
      ) : null}
      {errorOn ? (
        <p
          role="alert"
          aria-live="polite"
          className="mt-1 flex items-start gap-1.5 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>{t("oauthFailed")}</span>
        </p>
      ) : null}
    </div>
  );
}

interface ProviderButtonProps {
  provider: Provider;
  label: string;
  pending: Provider | null;
  errorOn: Provider | null;
  onClick: (provider: Provider) => void;
  children: React.ReactNode;
}

function ProviderButton({
  provider,
  label,
  pending,
  errorOn,
  onClick,
  children,
}: ProviderButtonProps) {
  const isPending = pending === provider;
  const isErrored = errorOn === provider;
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => onClick(provider)}
      disabled={pending !== null}
      aria-busy={isPending || undefined}
      aria-label={label}
      // h-11 on touch, h-10 on desktop — 44px minimum keeps the
      // primary OAuth tap target above the iOS guideline. The base
      // Button is h-10 so we only override on mobile.
      className="h-11 justify-start gap-3 sm:h-10"
    >
      {isPending ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : (
        children
      )}
      <span>{label}</span>
      {isErrored && !isPending ? (
        <AlertCircle
          className="ml-auto size-3.5 text-destructive"
          aria-hidden="true"
        />
      ) : null}
    </Button>
  );
}

// Lucide-react 1.x dropped the GitHub brand glyph for trademark
// reasons. Inlined SVG keeps the auth UI on a single icon dep.
function GithubGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
      role="presentation"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.9.58.11.79-.25.79-.56v-2.13c-3.2.7-3.88-1.36-3.88-1.36-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.2 1.77 1.2 1.03 1.78 2.71 1.27 3.37.97.1-.75.4-1.27.73-1.56-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.06 0 0 .97-.31 3.18 1.18a11.07 11.07 0 0 1 5.78 0c2.21-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.77.11 3.06.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.07.78 2.15v3.18c0 .31.21.68.79.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

// Lucide doesn't ship a Google glyph; this is the Google "G" mark
// drawn inline so we don't pull in another icon dep.
function GoogleGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="presentation"
    >
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.24 1.4-1.74 4.1-5.5 4.1-3.31 0-6-2.74-6-6.1S8.69 6 12 6c1.88 0 3.14.8 3.86 1.48l2.64-2.55C16.94 3.5 14.7 2.4 12 2.4 6.93 2.4 2.85 6.49 2.85 11.6S6.93 20.8 12 20.8c6.93 0 9.5-4.86 9.5-9.32 0-.62-.07-1.08-.16-1.28H12z"
      />
    </svg>
  );
}

function DiscordGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="currentColor"
      role="presentation"
    >
      <path d="M20.32 4.37A19.8 19.8 0 0 0 15.36 2.8a13.7 13.7 0 0 0-.64 1.33 18.3 18.3 0 0 0-5.44 0 13.7 13.7 0 0 0-.65-1.33 19.7 19.7 0 0 0-4.96 1.58C.53 9.16-.32 13.83.1 18.43a19.9 19.9 0 0 0 6.08 3.08c.49-.67.93-1.38 1.3-2.12a12.9 12.9 0 0 1-2.05-.98l.5-.39a14.2 14.2 0 0 0 12.16 0l.5.39c-.66.4-1.35.73-2.06.98.38.74.81 1.45 1.3 2.12a19.9 19.9 0 0 0 6.09-3.08c.5-5.34-.86-9.97-3.6-14.06ZM8.02 15.6c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42s2.17 1.1 2.15 2.42c0 1.34-.95 2.42-2.15 2.42Zm7.96 0c-1.18 0-2.15-1.08-2.15-2.42 0-1.33.95-2.42 2.15-2.42s2.17 1.1 2.15 2.42c0 1.34-.95 2.42-2.15 2.42Z" />
    </svg>
  );
}
