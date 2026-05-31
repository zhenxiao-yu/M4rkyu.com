import type { Metadata } from "next";
import type { ComponentType } from "react";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  AtSign,
  Briefcase,
  Camera,
  Code2,
  Coffee,
  Mail,
  MessageCircle,
  Star,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusPulse } from "@/components/ui/pixel/status-pulse";
import { ShineBorder } from "@/components/ui/magic/shine-border";
import { WorkspaceScene } from "@/components/sections/contact/workspace-scene";
import { profile } from "@/content/profile";
import type { Locale } from "@/i18n/routing";
import { buildAlternates } from "@/lib/seo/alternates";
import { cn, FOCUS_RING } from "@/lib/utils";
import { ContactForm } from "./_contact-form";

// No DB reads — static shell + client form. setRequestLocale →
// prerender statically, revalidate hourly.
export const dynamic = "force-static";
export const revalidate = 3600;

const REPO_URL = "https://github.com/zhenxiao-yu/M4rkyu.com";
const SITE_URL = "https://m4rkyu.com";
const QR_ASSET = "/qr-code.svg";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  return {
    title: tMeta("contactTitle"),
    description: tMeta("contactDescription"),
    alternates: buildAlternates(locale, "/contact"),
  };
}

type SocialEntry = {
  label: string;
  href?: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Contact" });
  const tMeta = await getTranslations({ locale, namespace: "Meta" });
  const tFooter = await getTranslations({ locale, namespace: "Footer" });

  const socials = profile.socials ?? {};
  // Reuse the footer's social vocabulary + labels so handles stay
  // single-sourced in profile.ts. Missing URLs render as "soon" chips.
  const socialEntries: SocialEntry[] = [
    { label: tFooter("socialEmail"), href: `mailto:${profile.email}`, icon: Mail },
    { label: tFooter("socialGithub"), href: socials.github, icon: Code2 },
    { label: tFooter("socialDevto"), href: socials.devto, icon: AtSign },
    { label: tFooter("socialLinkedin"), href: socials.linkedin, icon: Briefcase },
    { label: tFooter("socialTwitter"), href: socials.twitter, icon: MessageCircle },
    { label: tFooter("socialInstagram"), href: socials.instagram, icon: Camera },
  ];

  const host = SITE_URL.replace(/^https?:\/\//, "");

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={tMeta("contactTitle")}
        description={tMeta("contactDescription")}
        decorativeWord="SEND"
      />

      <PageSection innerClassName="grid items-stretch gap-6 lg:grid-cols-2 lg:gap-8">
        <>
          {/* Form console — DISPATCH № 01. The vertical ring-tinted
              hairline on the left echoes the wall-label idiom from the
              lightbox sidebar / auth modal / saved-items entries, so
              this surface reads as part of the same site language. */}
          <Card glass className="relative flex flex-col overflow-hidden">
            <span
              aria-hidden="true"
              className="absolute left-0 top-6 bottom-6 w-[2px] rounded-full bg-linear-to-b from-ring/55 via-ring/25 to-transparent"
            />
            <div
              aria-hidden="true"
              className="contact-sheet absolute inset-x-0 top-0 h-40 opacity-40 mask-[linear-gradient(to_bottom,black,transparent)]"
            />
            <CardHeader className="relative gap-3 pl-6">
              <div className="flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-2 font-mono text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground">
                  <StatusPulse tone="live" />
                  {t("formProviderTbd")}
                </span>
                <span
                  aria-hidden="true"
                  className="inline-flex shrink-0 items-baseline gap-1.5 font-pixel text-base leading-none uppercase tracking-wide text-muted-foreground/65"
                >
                  DISPATCH
                  <span className="tabular-nums">№ 01</span>
                </span>
              </div>
              <CardTitle as="h2" className="text-2xl sm:text-3xl">
                {t("inquiryTitle")}
              </CardTitle>
              {/* Meta strip — single hairline rule above; key/value pairs
                  read as a transmission header (LATENCY: T+2d / CHANNEL:
                  Resend). Kept compact so the form below dominates. */}
              <dl className="mt-2 grid grid-cols-1 gap-x-7 gap-y-1.5 border-t border-border/60 pt-3 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <dt className="text-muted-foreground/70">{t("metaResponseLabel")}</dt>
                  <dd className="text-foreground/85">{t("metaResponseValue")}</dd>
                </div>
                <div className="flex items-center gap-2">
                  <dt className="text-muted-foreground/70">{t("metaChannelLabel")}</dt>
                  <dd className="text-foreground/85">{t("metaChannelValue")}</dd>
                </div>
              </dl>
            </CardHeader>
            <CardContent className="relative flex flex-1 flex-col pl-6">
              <ContactForm email={profile.email} />
            </CardContent>
          </Card>

          {/* Direct lines — DIRECT LINES № 02. Sub-sectioned as a field
              log: each block has its own mono eyebrow + hairline rule,
              so the sidebar reads like a numbered transmission index
              instead of one undifferentiated stack of widgets. */}
          <Card glass className="relative flex flex-col overflow-hidden">
            <span
              aria-hidden="true"
              className="absolute left-0 top-6 bottom-6 w-[2px] rounded-full bg-linear-to-b from-ring/55 via-ring/25 to-transparent"
            />
            <CardHeader className="relative gap-3 pl-6">
              <div className="flex items-start justify-between gap-3">
                <CardTitle as="h2" className="text-2xl sm:text-3xl">
                  {t("directLinesTitle")}
                </CardTitle>
                <span
                  aria-hidden="true"
                  className="inline-flex shrink-0 items-baseline gap-1.5 font-pixel text-base leading-none uppercase tracking-wide text-muted-foreground/65"
                >
                  LINES
                  <span className="tabular-nums">№ 02</span>
                </span>
              </div>
            </CardHeader>
            <CardContent className="relative flex flex-1 flex-col gap-7 pl-6">
              <SidebarBlock label={t("channelsLabel")}>
                <ul
                  className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
                  aria-label={t("socialsTitle")}
                >
                  {socialEntries.map((entry) => (
                    <li key={entry.label}>
                      <SocialChip entry={entry} pendingLabel={tFooter("socialPending")} />
                    </li>
                  ))}
                </ul>
              </SidebarBlock>

              <SidebarBlock label={t("supportLabel")}>
                <div className="grid gap-2.5 sm:grid-cols-2">
                  <SupportButton
                    href={REPO_URL}
                    icon={Star}
                    label={t("starLabel")}
                    variant="ghost"
                  />
                  <SupportButton
                    href={socials.buymeacoffee}
                    icon={Coffee}
                    label={t("coffeeLabel")}
                    pendingLabel={tFooter("socialPending")}
                    variant="solid"
                  />
                </div>
              </SidebarBlock>

              <SidebarBlock label={t("workspaceLabel")} className="flex-1">
                {/* Workspace display — 3D battlestation in its framed
                    panel with the contact-sheet bleed + ring glow.
                    Unchanged behaviourally; just sits under the labeled
                    section header now. */}
                <div className="relative flex h-full min-h-56 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-background/30">
                  <div
                    aria-hidden="true"
                    className="contact-sheet absolute inset-0 opacity-[0.22] mask-[radial-gradient(circle_at_50%_58%,black,transparent_70%)]"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 56%, color-mix(in srgb, var(--ring) 15%, transparent), transparent 62%)",
                    }}
                  />
                  <WorkspaceScene className="relative" />
                  <ShineBorder borderRadius={8} duration={16} />
                </div>
              </SidebarBlock>

              <SidebarBlock label={t("qrTitle")}>
                {/* Signal anchor — scannable link to the live site. The
                    QR holds the host + handle to its right as a single
                    "signal" block, tighter than the previous chip card. */}
                <div className="flex items-center gap-4 rounded-lg border border-border/60 bg-background/40 p-5">
                  <a
                    href={SITE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${t("qrTitle")} · ${host}`}
                    className={cn("shrink-0 rounded-md", FOCUS_RING)}
                  >
                    <Image
                      src={QR_ASSET}
                      alt=""
                      width={96}
                      height={96}
                      className="size-24 rounded-md border border-border bg-white p-1.5"
                      loading="lazy"
                    />
                  </a>
                  <div className="min-w-0">
                    <p className="truncate font-mono text-sm text-foreground">
                      {host}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground/70">
                      <Code2 className="size-3" aria-hidden="true" />
                      {profile.githubHandle}
                    </p>
                  </div>
                </div>
              </SidebarBlock>
            </CardContent>
          </Card>
        </>
      </PageSection>
    </PageShell>
  );
}

/**
 * Sidebar sub-section — mono eyebrow + hairline rule + content.
 * Same beat as the saved-items section headers and the notes
 * monthly headers, so the contact sidebar reads as part of the
 * same numbered-index typography rather than a one-off treatment.
 */
function SidebarBlock({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("grid gap-3", className)}>
      <header className="flex items-baseline justify-between gap-3 border-b border-border/60 pb-2">
        <h3 className="font-mono text-[0.6rem] uppercase tracking-[0.24em] text-muted-foreground">
          {label}
        </h3>
      </header>
      {children}
    </section>
  );
}

function SocialChip({
  entry,
  pendingLabel,
}: {
  entry: SocialEntry;
  pendingLabel: string;
}) {
  const { label, href, icon: Icon } = entry;
  const base = cn(
    "inline-flex w-full items-center gap-2 rounded-full border px-3.5 py-2 text-sm transition-[color,border-color,transform] duration-(--motion-fast) ease-(--ease-premium)",
    FOCUS_RING,
  );

  if (!href) {
    return (
      <span
        className={cn(base, "cursor-default text-muted-foreground/45")}
        title={`${label} · ${pendingLabel}`}
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span className="truncate">{label}</span>
        <Badge variant="outline" className="ml-auto text-[0.5rem] uppercase tracking-[0.18em]">
          {pendingLabel}
        </Badge>
      </span>
    );
  }

  const isMail = href.startsWith("mailto:");
  return (
    <a
      href={href}
      target={isMail ? undefined : "_blank"}
      rel={isMail ? undefined : "noopener noreferrer"}
      className={cn(
        base,
        "text-muted-foreground hover:border-ring/50 hover:text-foreground motion-safe:hover:-translate-y-0.5",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span className="truncate">{label}</span>
    </a>
  );
}

function SupportButton({
  href,
  icon: Icon,
  label,
  pendingLabel,
  variant,
}: {
  href?: string;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  label: string;
  pendingLabel?: string;
  variant: "solid" | "ghost";
}) {
  const base = cn(
    "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-md px-4 text-sm font-medium transition-[color,background-color,border-color,transform] duration-(--motion-fast) ease-(--ease-premium)",
    FOCUS_RING,
  );

  if (!href) {
    return (
      <span
        className={cn(base, "cursor-default border text-muted-foreground/45")}
        title={pendingLabel ? `${label} · ${pendingLabel}` : label}
      >
        <Icon className="size-4" aria-hidden="true" />
        {label}
        {pendingLabel ? (
          <Badge variant="outline" className="text-[0.5rem] uppercase tracking-[0.18em]">
            {pendingLabel}
          </Badge>
        ) : null}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        base,
        "border motion-safe:hover:-translate-y-0.5",
        variant === "solid"
          ? "border-ring/60 bg-foreground text-background hover:bg-foreground/90"
          : "text-foreground hover:border-ring/50 hover:bg-muted/40",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {label}
    </a>
  );
}
