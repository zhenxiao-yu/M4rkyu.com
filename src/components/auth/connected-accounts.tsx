"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Check, Link2, Loader2, Mail, Unlink } from "lucide-react";
import type { UserIdentity } from "@supabase/supabase-js";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { resolveSiteOrigin } from "@/lib/auth/redirect-url";
import { authProviderFlags } from "@/lib/auth/provider-flags";
import { unlinkIdentityAction } from "@/lib/auth/actions";
import { cn } from "@/lib/utils";

interface ConnectedAccountsProps {
  identities: UserIdentity[];
}

type ConnectableProvider = "google" | "github" | "discord";

const ALL_PROVIDERS: ConnectableProvider[] = ["github", "google", "discord"];

/**
 * Lets the signed-in user link / unlink OAuth providers (and see
 * their email identity) on their account. Once two providers are
 * linked the user can sign in via either one — modern "auto sign-in
 * with anything" parity.
 *
 * Connect is a browser-side `auth.linkIdentity` call (it redirects
 * through the OAuth provider, exactly like sign-in). Disconnect is a
 * server action that calls `auth.unlinkIdentity`. Supabase itself
 * refuses to remove the *last* identity on an account; we mirror
 * that check client-side so the button never even fires.
 */
export function ConnectedAccounts({ identities }: ConnectedAccountsProps) {
  const t = useTranslations("Account.security.connected");
  const [unlinkState, unlinkAction, unlinkPending] = useActionState(
    unlinkIdentityAction,
    { status: "idle" as const },
  );

  const providersEnabled = authProviderFlags();
  const linkedByProvider = new Map(
    identities.map((row) => [row.provider, row] as const),
  );
  const onlyOneIdentity = identities.length <= 1;

  return (
    <section
      aria-labelledby="security-connected"
      className="grid gap-3 border-t border-border pt-6"
    >
      <header className="grid gap-1">
        <h3
          id="security-connected"
          className="flex items-center gap-2 text-sm font-medium"
        >
          <Link2 className="size-4" aria-hidden="true" />
          {t("title")}
        </h3>
        <p className="text-[0.7rem] text-muted-foreground">
          {t("description")}
        </p>
      </header>

      <ul className="grid gap-2">
        {ALL_PROVIDERS.map((provider) => {
          if (!providersEnabled[provider]) return null;
          const linked = linkedByProvider.get(provider);
          return (
            <li key={provider}>
              <ProviderRow
                provider={provider}
                linked={linked}
                onlyOneIdentity={onlyOneIdentity}
                unlinkAction={unlinkAction}
                unlinkPending={unlinkPending}
              />
            </li>
          );
        })}

        {/* Email identity is informational — there's no "Connect
         * email" affordance (the user would just sign in via magic
         * link to create it). Show it when present. */}
        {linkedByProvider.has("email") ? (
          <li>
            <EmailRow
              email={
                linkedByProvider.get("email")?.identity_data?.email as
                  | string
                  | undefined
              }
              identityId={linkedByProvider.get("email")?.identity_id ?? ""}
              onlyOneIdentity={onlyOneIdentity}
              unlinkAction={unlinkAction}
              unlinkPending={unlinkPending}
            />
          </li>
        ) : null}
      </ul>

      {unlinkState.status === "ok" ? (
        <p
          role="status"
          aria-live="polite"
          className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground"
        >
          {t("disconnected")}
        </p>
      ) : null}
      {unlinkState.status === "error" ? (
        <p
          role="alert"
          aria-live="polite"
          className="flex items-start gap-1.5 text-xs text-destructive"
        >
          <AlertCircle
            className="mt-0.5 size-3.5 shrink-0"
            aria-hidden="true"
          />
          <span>{t(`unlinkError.${unlinkState.messageKey}`)}</span>
        </p>
      ) : null}

      {onlyOneIdentity ? (
        <p className="text-[0.7rem] text-muted-foreground">
          {t("lastIdentityHint")}
        </p>
      ) : null}
    </section>
  );
}

interface ProviderRowProps {
  provider: ConnectableProvider;
  linked: UserIdentity | undefined;
  onlyOneIdentity: boolean;
  unlinkAction: (formData: FormData) => void;
  unlinkPending: boolean;
}

function ProviderRow({
  provider,
  linked,
  onlyOneIdentity,
  unlinkAction,
  unlinkPending,
}: ProviderRowProps) {
  const t = useTranslations("Account.security.connected");
  const tAuth = useTranslations("Auth");
  const [linkPending, setLinkPending] = useState(false);
  const [linkError, setLinkError] = useState<LinkIdentityMessageKey | null>(
    null,
  );

  async function handleLink() {
    setLinkError(null);
    setLinkPending(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const origin = resolveSiteOrigin(
        typeof window !== "undefined" ? window.location.origin : null,
      );
      const { error } = await supabase.auth.linkIdentity({
        provider,
        options: { redirectTo: `${origin}/auth/callback` },
      });
      if (error) {
        setLinkError(classifyLinkIdentityError(error));
        setLinkPending(false);
      }
      // Success path redirects the browser through the OAuth dance.
    } catch {
      setLinkError("linkFailed");
      setLinkPending(false);
    }
  }

  const label = providerAuthLabel(provider, tAuth);
  const providerName = providerDisplayName(provider);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card/40 px-3 py-2",
        linked && "border-ring/40",
      )}
    >
      <div className="flex items-center gap-3 text-sm">
        <ProviderGlyph provider={provider} className="size-4" />
        <div className="grid">
          <span className="font-medium">{providerName}</span>
          {linked ? (
            <span className="text-[0.7rem] text-muted-foreground">
              {linked.identity_data?.email ?? t("connected")}
            </span>
          ) : (
            <span className="text-[0.7rem] text-muted-foreground">
              {t("notConnected")}
            </span>
          )}
        </div>
      </div>

      {linked ? (
        <form action={unlinkAction}>
          <input type="hidden" name="identity_id" value={linked.identity_id} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={unlinkPending || onlyOneIdentity}
            className="gap-1.5"
          >
            <Unlink className="size-3.5" aria-hidden="true" />
            {t("disconnect")}
          </Button>
        </form>
      ) : (
        <div className="grid gap-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={linkPending}
            onClick={handleLink}
            aria-busy={linkPending || undefined}
            className="gap-1.5"
          >
            {linkPending ? (
              <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <Link2 className="size-3.5" aria-hidden="true" />
            )}
            {label}
          </Button>
          {linkError ? (
            <p
              role="alert"
              aria-live="polite"
              className="text-[0.7rem] text-destructive"
            >
              {t(`linkError.${linkError}`)}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

type LinkIdentityMessageKey =
  | "manualLinkingDisabled"
  | "alreadyConnected"
  | "sessionExpired"
  | "linkFailed";

function classifyLinkIdentityError(error: {
  code?: string;
  message?: string;
  status?: number;
}): LinkIdentityMessageKey {
  const code = (error.code ?? "").toLowerCase();
  const message = (error.message ?? "").toLowerCase();

  if (
    code === "manual_linking_disabled" ||
    message.includes("manual linking")
  ) {
    return "manualLinkingDisabled";
  }
  if (
    code === "identity_already_exists" ||
    message.includes("already registered") ||
    message.includes("already linked")
  ) {
    return "alreadyConnected";
  }
  if (error.status === 401 || code === "session_not_found") {
    return "sessionExpired";
  }
  return "linkFailed";
}

function providerAuthLabel(
  provider: ConnectableProvider,
  tAuth: ReturnType<typeof useTranslations>,
): string {
  switch (provider) {
    case "google":
      return tAuth("continueWithGoogle");
    case "github":
      return tAuth("continueWithGithub");
    case "discord":
      return tAuth("continueWithDiscord");
  }
}

function providerDisplayName(provider: ConnectableProvider): string {
  switch (provider) {
    case "google":
      return "Google";
    case "github":
      return "GitHub";
    case "discord":
      return "Discord";
  }
}

function ProviderGlyph({
  provider,
  className,
}: {
  provider: ConnectableProvider;
  className?: string;
}) {
  switch (provider) {
    case "google":
      return <GoogleGlyph className={className} />;
    case "github":
      return <GithubGlyph className={className} />;
    case "discord":
      return <DiscordGlyph className={className} />;
  }
}

function EmailRow({
  email,
  identityId,
  onlyOneIdentity,
  unlinkAction,
  unlinkPending,
}: {
  email: string | undefined;
  identityId: string;
  onlyOneIdentity: boolean;
  unlinkAction: (formData: FormData) => void;
  unlinkPending: boolean;
}) {
  const t = useTranslations("Account.security.connected");
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card/40 px-3 py-2">
      <div className="flex items-center gap-3 text-sm">
        <Mail className="size-4" aria-hidden="true" />
        <div className="grid">
          <span className="font-medium">{t("emailProvider")}</span>
          <span className="flex items-center gap-1 text-[0.7rem] text-muted-foreground">
            <Check className="size-3" aria-hidden="true" />
            {email ?? t("connected")}
          </span>
        </div>
      </div>
      {identityId ? (
        <form action={unlinkAction}>
          <input type="hidden" name="identity_id" value={identityId} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={unlinkPending || onlyOneIdentity}
            className="gap-1.5"
          >
            <Unlink className="size-3.5" aria-hidden="true" />
            {t("disconnect")}
          </Button>
        </form>
      ) : null}
    </div>
  );
}

// Inlined provider glyphs to match the existing OAuthButtons
// component — no extra icon dep.
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
