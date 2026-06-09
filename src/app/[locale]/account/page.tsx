import { getTranslations } from "next-intl/server";
import {
  ArrowUpRight,
  Bookmark,
  LayoutDashboard,
  MessageSquare,
  Settings2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth/require-user";
import type { CurrentUser } from "@/lib/auth/get-current-user";
import type { Locale } from "@/i18n/routing";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
import { AccountNav } from "./_components/account-nav";

export const dynamic = "force-dynamic";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const user = await requireUser(locale);
  const t = await getTranslations({ locale, namespace: "Account" });

  const memberSince = user.profile?.created_at
    ? new Date(user.profile.created_at).toISOString().slice(0, 10).replaceAll("-", ".")
    : "—";

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
        decorativeWord="ACCOUNT"
      />
      <PageSection>
        <AccountNav locale={locale} />

        <div className="grid gap-12">
          {/* Identity credential — glass panel signed by the single ring
            * hairline on the left (the wall-label idiom shared with the
            * saved empty state and the admin manage-content cards). */}
          <section className="relative overflow-hidden rounded-[1.25rem] glass-surface p-6 pl-7 sm:p-8 sm:pl-9">
            <span
              aria-hidden="true"
              className="absolute left-3 top-6 bottom-6 w-px bg-linear-to-b from-ring/60 via-ring/25 to-transparent sm:left-4"
            />

            <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              {t("identityLabel")}
            </p>

            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <Avatar user={user} />
                <div className="min-w-0">
                  <h2 className="truncate font-display text-xl font-semibold leading-tight tracking-tight sm:text-2xl">
                    {user.profile?.display_name ??
                      user.profile?.username ??
                      t("anonymous")}
                  </h2>
                  {user.profile?.username ? (
                    <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                      @{user.profile.username}
                    </p>
                  ) : null}
                  {user.email ? (
                    <p className="mt-0.5 truncate font-mono text-[0.7rem] text-muted-foreground/80">
                      {user.email}
                    </p>
                  ) : null}
                </div>
              </div>
              <SignOutButton locale={locale} />
            </div>

            {/* Spec sheet — mono labels over their values, separated by a
              * hairline. Reads like the registration strip on an
              * instrument panel. */}
            <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border/60 pt-6 sm:grid-cols-4">
              <SpecCell label={t("memberSince")}>
                <span className="font-pixel text-lg leading-none tabular-nums text-foreground">
                  {memberSince}
                </span>
              </SpecCell>

              <SpecCell label={t("status.visibilityLabel")}>
                <span className="text-sm font-medium text-foreground">
                  {user.profile?.public_profile ?? true
                    ? t("status.public")
                    : t("status.private")}
                </span>
              </SpecCell>

              <SpecCell label={t("status.roleLabel")}>
                {user.isAdmin ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-ring/40 bg-ring/10 px-2 py-0.5 text-xs font-medium text-foreground">
                    <span
                      aria-hidden="true"
                      className="size-1.5 rounded-full bg-ring"
                    />
                    {t("adminBadge")}
                  </span>
                ) : (
                  <span className="text-sm font-medium text-foreground">
                    {t("status.member")}
                  </span>
                )}
              </SpecCell>

              {user.identities.length > 0 ? (
                <SpecCell
                  label={t("signInMethods")}
                  className="col-span-2 sm:col-span-1"
                >
                  <div className="flex flex-wrap gap-1.5">
                    {user.identities.map((row) => (
                      <ProviderChip key={row.identity_id} provider={row.provider} />
                    ))}
                  </div>
                </SpecCell>
              ) : null}
            </dl>

            {/* Bio — quiet trailing note, or the gentle nudge to add one. */}
            <p
              className={cn(
                "mt-6 max-w-prose text-sm leading-6",
                user.profile?.bio
                  ? "text-foreground/80"
                  : "text-muted-foreground",
              )}
            >
              {user.profile?.bio ?? t("noBio")}
            </p>
          </section>

          {/* Quick-link console — the three sibling sections as
            * field-notebook entries, channel-numbered and ring-ruled,
            * matching the saved page's entry rows so the whole area
            * reads as one instrument. */}
          <section>
            <header className="flex items-baseline justify-between gap-3 border-b border-border/70 pb-3">
              <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
                {t("quickLinks")}
              </h2>
              <span
                aria-hidden="true"
                className="font-pixel text-sm leading-none tabular-nums text-muted-foreground/70"
              >
                {String(user.isAdmin ? 4 : 3).padStart(2, "0")}
              </span>
            </header>

            <ol className="grid gap-1 pt-1">
              {/* Admin portal — privileged lead row, ring-lit by default so
                * it reads as the elevated destination. Only rendered for
                * admins; the route itself is independently gated. */}
              {user.isAdmin ? (
                <SectionLink
                  channel="00"
                  href="/admin"
                  locale={locale}
                  icon={LayoutDashboard}
                  title={t("adminConsole")}
                  description={t("sectionDescription.admin")}
                  highlighted
                />
              ) : null}
              <SectionLink
                channel="01"
                href="/account/saved"
                locale={locale}
                icon={Bookmark}
                title={t("saved")}
                description={t("sectionDescription.saved")}
              />
              <SectionLink
                channel="02"
                href="/account/comments"
                locale={locale}
                icon={MessageSquare}
                title={t("comments")}
                description={t("sectionDescription.comments")}
              />
              <SectionLink
                channel="03"
                href="/account/settings"
                locale={locale}
                icon={Settings2}
                title={t("settings")}
                description={t("sectionDescription.settings")}
              />
            </ol>
          </section>
        </div>
      </PageSection>
    </PageShell>
  );
}

function Avatar({ user }: { user: CurrentUser }) {
  const fallback = (user.profile?.display_name ?? user.email ?? "?")
    .charAt(0)
    .toUpperCase();

  // Ring-frame the avatar so identity gets the single accent. The soft
  // glow is the same ring colour at low alpha — depth without a second hue.
  return (
    <span className="relative shrink-0">
      <span
        aria-hidden="true"
        className="absolute -inset-1 rounded-full bg-ring/15 blur-md"
      />
      {user.profile?.avatar_url ? (
        // eslint-disable-next-line @next/next/no-img-element -- OAuth avatar host is not in next/image allowlist
        <img
          src={user.profile.avatar_url}
          alt=""
          className="relative size-14 rounded-full object-cover ring-1 ring-ring/40 sm:size-16"
          referrerPolicy="no-referrer"
        />
      ) : (
        <span
          aria-hidden="true"
          className="relative grid size-14 place-items-center rounded-full bg-muted text-lg font-semibold ring-1 ring-ring/40 sm:size-16"
        >
          {fallback}
        </span>
      )}
    </span>
  );
}

function SpecCell({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid gap-2", className)}>
      <dt className="font-mono text-[0.55rem] uppercase tracking-[0.2em] text-muted-foreground">
        {label}
      </dt>
      <dd className="min-h-6">{children}</dd>
    </div>
  );
}

function ProviderChip({ provider }: { provider: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/60 px-2 py-0.5 font-mono text-[0.62rem] text-muted-foreground">
      <span
        aria-hidden="true"
        className="size-1 rounded-full bg-foreground/40"
      />
      {providerLabel(provider)}
    </span>
  );
}

function SectionLink({
  channel,
  href,
  locale,
  icon: Icon,
  title,
  description,
  highlighted = false,
}: {
  channel: string;
  href: "/admin" | "/account/saved" | "/account/comments" | "/account/settings";
  locale: Locale;
  icon: LucideIcon;
  title: string;
  description: string;
  /** Privileged destination (the admin portal) — ring-lit by default
   * instead of only on hover, so it sits above the personal sections. */
  highlighted?: boolean;
}) {
  return (
    <li
      className={cn(
        "group relative overflow-hidden rounded-md transition-colors duration-(--motion-fast) ease-(--ease-premium)",
        highlighted ? "bg-ring/6 hover:bg-ring/10" : "hover:bg-card/55",
      )}
    >
      {/* Left accent rule — the shared field-notebook entry signature.
        * Lit to --ring from the start for the privileged row; otherwise
        * ignites on hover. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute left-0 top-2 bottom-2 w-[2px] rounded-full transition-colors duration-(--motion-medium) ease-(--ease-premium)",
          highlighted ? "bg-ring" : "bg-border/70 group-hover:bg-ring",
        )}
      />
      <Link
        href={href}
        locale={locale}
        className={cn("block pl-2", FOCUS_RING_INSET)}
      >
        <div className="grid grid-cols-[2.5rem_1.75rem_1fr_auto] items-center gap-3 px-3 py-3.5">
          <span
            aria-hidden="true"
            className={cn(
              "font-pixel text-xl leading-none tabular-nums transition-colors duration-(--motion-fast) ease-(--ease-premium)",
              highlighted
                ? "text-ring"
                : "text-muted-foreground/70 group-hover:text-foreground",
            )}
          >
            {channel}
          </span>
          <Icon
            aria-hidden="true"
            className={cn(
              "size-4 transition-colors duration-(--motion-fast) ease-(--ease-premium)",
              highlighted
                ? "text-ring/90"
                : "text-muted-foreground group-hover:text-foreground",
            )}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium leading-snug text-foreground">
              {title}
            </p>
            <p className="mt-0.5 truncate font-mono text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground">
              {description}
            </p>
          </div>
          <ArrowUpRight
            aria-hidden="true"
            className={cn(
              "size-4 transition-all duration-(--motion-fast) ease-(--ease-premium) group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground",
              highlighted ? "text-ring/70" : "text-muted-foreground/50",
            )}
          />
        </div>
      </Link>
    </li>
  );
}

// Provider strings come straight out of Supabase (`google`, `github`,
// `discord`, `email`, possibly future ones). We display them tidied — anything
// we don't recognise renders verbatim with the first letter cased.
function providerLabel(provider: string): string {
  switch (provider) {
    case "google":
      return "Google";
    case "github":
      return "GitHub";
    case "discord":
      return "Discord";
    case "email":
      return "Email";
    default:
      return provider.charAt(0).toUpperCase() + provider.slice(1);
  }
}
