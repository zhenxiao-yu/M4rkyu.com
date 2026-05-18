"use client";

import { useState } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { resolveSiteOrigin } from "@/lib/auth/redirect-url";
import { authProviderFlags } from "@/lib/auth/provider-flags";

type Provider = "google" | "github";

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
  const { google: googleEnabled, github: githubEnabled } = authProviderFlags();

  async function handleProvider(provider: Provider) {
    setErrorOn(null);
    setPending(provider);
    try {
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
