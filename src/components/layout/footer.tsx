import { getTranslations } from "next-intl/server";
import {
  ArrowUpRight,
  AtSign,
  Briefcase,
  Camera,
  Code2,
  Ghost,
  Mail,
  MapPin,
  MessageCircle,
  Music2,
  PlaySquare,
  SquareCode,
  ThumbsUp,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { profile } from "@/content/profile";
import { isNewsletterConfigured } from "@/lib/newsletter/config";
import { SubscribeForm } from "@/components/newsletter/subscribe-form";
import { DotGrid } from "@/components/ui/magic/dot-grid";
import { GhostedWord } from "@/components/ui/magic/ghosted-word";
import { ShinyText } from "@/components/ui/magic/shiny-text";
import { DecryptedText } from "@/components/ui/magic/decrypted-text";
import { AnimatedGridPattern } from "@/components/ui/magic/animated-grid-pattern";
import { StarGlyph } from "@/components/ui/magic/star-glyph";
import { StatusPulse } from "@/components/ui/pixel/status-pulse";
import { FooterClock } from "./footer-clock";
import { FooterBackToTop } from "./footer-back-to-top";
import {
  SitemapColumn,
  SocialIcon,
  type FooterLink,
  type FooterSocial,
} from "./footer-parts";
import { cn, FOCUS_RING } from "@/lib/utils";

function isPublishedResume(href?: string) {
  if (!href) return false;
  return !href.startsWith("/");
}

export async function Footer({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Footer" });
  const tNewsletter = await getTranslations({ locale, namespace: "Newsletter" });
  const year = new Date().getFullYear();
  const newsletterOpen = isNewsletterConfigured();

  const socials = profile.socials ?? {};
  const resumeHref = profile.resumeUrl;
  const resumeReady = isPublishedResume(resumeHref);

  const workLinks: FooterLink[] = [
    { label: t("linkProjects"), href: "/work" },
    { label: t("linkGames"), href: "/games" },
    { label: t("linkArchive"), href: "/archive" },
    { label: t("linkLogs"), href: "/logs" },
  ];

  const resourceLinks: FooterLink[] = [
    { label: t("linkSearch"), href: "/search" },
    { label: t("linkLatest"), href: "/latest" },
    { label: t("linkTools"), href: "/resources/tools" },
    { label: t("linkLinks"), href: "/resources/links" },
    { label: t("linkNotes"), href: "/notes" },
    { label: t("linkTopics"), href: "/topics" },
    { label: t("linkRss"), href: "/feed.xml", external: true },
    { label: t("linkJsonFeed"), href: "/feed.json", external: true },
    { label: t("linkShop"), href: "/shop" },
  ];

  const studioLinks: FooterLink[] = [
    { label: t("linkAbout"), href: "/about" },
    { label: t("linkContact"), href: "/contact" },
    { label: t("linkChangelog"), href: "/changelog" },
    { label: t("linkColophon"), href: "/colophon" },
    resumeReady && resumeHref
      ? { label: t("linkResume"), href: resumeHref, external: true }
      : { label: t("linkResume"), href: "/about", pending: true },
  ];

  // "Elsewhere" column — only channels that actually resolve, rendered
  // as real external links. The platforms still to come collapse into a
  // single honest "soon" line (`socialSoon`) instead of a column of dead
  // placeholder rows, which read as unfinished.
  const githubHref = socials.github ?? "https://github.com/zhenxiao-yu";
  const socialColumnLinks: FooterLink[] = [
    { label: t("socialGithub"), href: githubHref, external: true },
    ...(socials.devto
      ? [{ label: t("socialDevto"), href: socials.devto, external: true } as FooterLink]
      : []),
    ...(socials.linkedin
      ? [{ label: t("socialLinkedin"), href: socials.linkedin, external: true } as FooterLink]
      : []),
    ...(socials.twitter
      ? [{ label: t("socialTwitter"), href: socials.twitter, external: true } as FooterLink]
      : []),
    ...(socials.instagram
      ? [
          {
            label: t("socialInstagram"),
            href: socials.instagram,
            external: true,
          } as FooterLink,
        ]
      : []),
    ...(socials.facebook
      ? [{ label: t("socialFacebook"), href: socials.facebook, external: true } as FooterLink]
      : []),
    ...(socials.youtube
      ? [{ label: t("socialYoutube"), href: socials.youtube, external: true } as FooterLink]
      : []),
    ...(socials.codepen
      ? [{ label: t("socialCodepen"), href: socials.codepen, external: true } as FooterLink]
      : []),
    ...(socials.spotify
      ? [{ label: t("socialSpotify"), href: socials.spotify, external: true } as FooterLink]
      : []),
    ...(socials.snapchat
      ? [{ label: t("socialSnapchat"), href: socials.snapchat, external: true } as FooterLink]
      : []),
    { label: t("socialEmail"), href: `mailto:${profile.email}`, external: true },
  ];
  const socialSoon = [
    { label: t("socialLinkedin"), href: socials.linkedin },
    { label: t("socialInstagram"), href: socials.instagram },
    { label: t("socialYoutube"), href: socials.youtube },
  ]
    .filter((s) => !s.href)
    .map((s) => s.label);

  // Micro-rail icons — the live channels only, so the row never wraps
  // into an orphaned second line of disabled placeholders.
  const socialEntries: FooterSocial[] = [
    {
      key: "email",
      label: t("socialEmail"),
      href: `mailto:${profile.email}`,
      icon: Mail,
    },
    { key: "github", label: t("socialGithub"), href: githubHref, icon: Code2 },
    { key: "devto", label: t("socialDevto"), href: socials.devto, icon: AtSign },
    ...(socials.linkedin
      ? [
          {
            key: "linkedin",
            label: t("socialLinkedin"),
            href: socials.linkedin,
            icon: Briefcase,
          } as FooterSocial,
        ]
      : []),
    ...(socials.twitter
      ? [
          {
            key: "twitter",
            label: t("socialTwitter"),
            href: socials.twitter,
            icon: MessageCircle,
          } as FooterSocial,
        ]
      : []),
    ...(socials.instagram
      ? [
          {
            key: "instagram",
            label: t("socialInstagram"),
            href: socials.instagram,
            icon: Camera,
          } as FooterSocial,
        ]
      : []),
    ...(socials.facebook
      ? [
          {
            key: "facebook",
            label: t("socialFacebook"),
            href: socials.facebook,
            icon: ThumbsUp,
          } as FooterSocial,
        ]
      : []),
    ...(socials.youtube
      ? [
          {
            key: "youtube",
            label: t("socialYoutube"),
            href: socials.youtube,
            icon: PlaySquare,
          } as FooterSocial,
        ]
      : []),
    ...(socials.codepen
      ? [
          {
            key: "codepen",
            label: t("socialCodepen"),
            href: socials.codepen,
            icon: SquareCode,
          } as FooterSocial,
        ]
      : []),
    ...(socials.spotify
      ? [
          {
            key: "spotify",
            label: t("socialSpotify"),
            href: socials.spotify,
            icon: Music2,
          } as FooterSocial,
        ]
      : []),
    ...(socials.snapchat
      ? [
          {
            key: "snapchat",
            label: t("socialSnapchat"),
            href: socials.snapchat,
            icon: Ghost,
          } as FooterSocial,
        ]
      : []),
  ];

  return (
    // Editorial footer — no inner card panels. Sits on a soft DotGrid
    // backdrop with a low ring-tinted glow at the bottom, and runs
    // top-to-bottom as: status strip · hero CTA · sitemap · wordmark ·
    // micro rail. Everything inside a single max-w-page column so the
    // rhythm reads like end credits rather than a SaaS hand-off.
    <footer className="relative isolate overflow-hidden border-t bg-background">
      <DotGrid
        className="pointer-events-none absolute inset-0 opacity-25 [mask-image:linear-gradient(to_top,black,transparent_72%)]"
        spacing={36}
        baseDotSize={1}
        hoverDotSize={3.4}
        influenceRadius={160}
        baseOpacity={0.1}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[60%]"
        style={{
          background:
            "radial-gradient(ellipse 70% 80% at 50% 100%, color-mix(in srgb, var(--ring) 9%, transparent), transparent 70%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-page px-4 sm:px-6 lg:px-8">
        {/* 1. Status strip — slim, alive */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b py-3.5">
          <div className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
            <StatusPulse tone="now" />
            <span className="text-foreground/80">{t("statusOpen")}</span>
            <span className="hidden text-muted-foreground/70 sm:inline">·</span>
            <span className="hidden sm:inline">
              {t("statusAccepting", { year })}
            </span>
          </div>
          <FooterClock label={t("localTimeLabel")} />
        </div>

        {/* 2. Hero CTA — the centerpiece. An animated grid (opacity-only,
            GPU-cheap, no pointer cost) replaces the old cursor-driven
            MagnetLines field, which recalculated 300+ DOM transforms on
            every pointermove and felt laggy. Copy + CTAs read centered on
            top; the grid edge-fades into the surrounding atmosphere via a
            radial mask so the field never feels "rectangular." */}
        <section className="relative isolate overflow-hidden py-20 sm:py-28 lg:py-32">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              WebkitMaskImage:
                "radial-gradient(ellipse 72% 62% at 50% 50%, black 45%, transparent 90%)",
              maskImage:
                "radial-gradient(ellipse 72% 62% at 50% 50%, black 45%, transparent 90%)",
            }}
          >
            <AnimatedGridPattern
              numSquares={24}
              maxOpacity={0.2}
              duration={5}
              repeatDelay={0.6}
              className="text-foreground/25"
            />
          </div>

          {/* Copy + CTA cluster centered above the animated grid */}
          <div className="relative z-10 mx-auto flex max-w-3xl flex-col items-center gap-7 text-center sm:gap-8">
            <div className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">
              <StarGlyph className="size-2.5 text-ring" />
              {t("eyebrow")}
            </div>
            <h2 className="font-display text-4xl font-semibold leading-[1.04] tracking-tight text-balance sm:text-5xl lg:text-6xl xl:text-7xl">
              <span className="block">{t("headlinePrimary")}</span>
              <span className="block text-muted-foreground/90">
                <ShinyText duration={5}>{t("headlineSecondary")}</ShinyText>
              </span>
            </h2>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground text-balance sm:text-base sm:leading-7">
              <span className="font-medium text-foreground">
                {t("metaResponse")}
              </span>{" "}
              · {t("metaAvailability")}
            </p>
            <div className="mt-2 flex items-center justify-center">
              <Link
                href="/contact"
                locale={locale}
                className={cn(
                  "group relative inline-flex min-h-12 items-center gap-2.5 overflow-hidden rounded-full border border-foreground bg-foreground px-5 py-2.5 font-mono text-xs uppercase tracking-[0.22em] text-background shadow-[0_1px_0_0_color-mix(in_srgb,var(--foreground)_30%,transparent)] transition-shadow duration-(--motion-medium) ease-(--ease-premium) hover:shadow-[0_18px_42px_-20px_color-mix(in_srgb,var(--foreground)_60%,transparent)]",
                  FOCUS_RING,
                )}
              >
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-(--motion-medium) ease-(--ease-premium) group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--ring) 28%, transparent), transparent 70%)",
                  }}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-transparent via-background/40 to-transparent opacity-0 group-hover:animate-[button-shine_900ms_var(--ease-premium)_1_forwards]"
                />
                <span
                  aria-hidden="true"
                  className="relative inline-block size-1.5 rounded-full bg-background/85 shadow-[0_0_0_3px_color-mix(in_srgb,var(--background)_18%,transparent)]"
                />
                <span className="relative">{t("ctaConversation")}</span>
                <ArrowUpRight
                  className="relative size-3.5 transition-transform duration-(--motion-fast) ease-(--ease-premium) motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </div>
        </section>

        {/* 2b. Newsletter — only when configured (isNewsletterConfigured). */}
        {newsletterOpen ? (
          <section className="border-t py-10">
            <div className="mx-auto max-w-xl text-center">
              <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
                {tNewsletter("eyebrow")}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-foreground">
                {tNewsletter("formHeading")}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                {tNewsletter("formBlurb")}
              </p>
              <div className="mx-auto mt-5 max-w-md text-left">
                <SubscribeForm />
              </div>
            </div>
          </section>
        ) : null}

        {/* 3. Sitemap — four editorial columns with a one-line blurb each */}
        <div className="grid gap-10 border-t py-12 sm:grid-cols-2 lg:grid-cols-4">
          <SitemapColumn
            title={t("sectionWork")}
            blurb={t("sectionWorkBlurb")}
            links={workLinks}
            locale={locale}
            pendingLabel={t("resumePending")}
          />
          <SitemapColumn
            title={t("sectionResources")}
            blurb={t("sectionResourcesBlurb")}
            links={resourceLinks}
            locale={locale}
            pendingLabel={t("resumePending")}
          />
          <SitemapColumn
            title={t("sectionStudio")}
            blurb={t("sectionStudioBlurb")}
            links={studioLinks}
            locale={locale}
            pendingLabel={t("resumePending")}
          />
          <SitemapColumn
            title={t("sectionSocials")}
            blurb={t("sectionSocialsBlurb")}
            links={socialColumnLinks}
            locale={locale}
            pendingLabel={t("socialPending")}
            note={
              socialSoon.length
                ? `${socialSoon.join(" · ")} · ${t("socialPending")}`
                : undefined
            }
          />
        </div>

        {/* 4. Wordmark — end-credits signature */}
        <div className="relative grid place-items-center gap-5 py-12 sm:py-16">
          <Link
            href="/"
            locale={locale}
            aria-label="M4rkyu.com"
            className={cn(
              "group block w-full text-center leading-none",
              FOCUS_RING,
            )}
          >
            <GhostedWord
              text="M4RKYU"
              ghosts={6}
              spread={22}
              className="font-wordmark text-[clamp(3.25rem,15vw,14rem)] font-bold leading-[0.95] tracking-[-0.04em] text-foreground/90 transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:text-foreground"
            />
          </Link>
          <div className="flex items-center gap-4 font-mono text-[0.65rem] uppercase tracking-[0.32em] text-muted-foreground">
            <span aria-hidden="true" className="h-px w-10 bg-border sm:w-16" />
            <ShinyText duration={6}>{t("wordmarkSince")}</ShinyText>
            <span aria-hidden="true" className="h-px w-10 bg-border sm:w-16" />
          </div>
          <div className="hidden text-center text-[0.6rem] font-mono uppercase tracking-[0.28em] text-muted-foreground/70 sm:block">
            <DecryptedText
              text={profile.name}
              animateOn="view"
              sequential
              revealDirection="center"
              speed={55}
              useOriginalCharsOnly
            />
          </div>
        </div>

        {/* 5. Micro rail — copyright, location, socials, tech, top */}
        <div className="border-t py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
              <span className="text-foreground/80">
                © {year} {profile.name}
              </span>
              <span aria-hidden="true" className="hidden sm:inline">
                ·
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3 opacity-70" aria-hidden="true" />
                {t("locationLine")}
              </span>
              <span aria-hidden="true" className="hidden sm:inline">
                ·
              </span>
              <span className="flex items-center gap-3">
                <Link
                  href="/privacy"
                  locale={locale}
                  className={cn(
                    "rounded-sm transition-colors hover:text-foreground",
                    FOCUS_RING,
                  )}
                >
                  {t("linkPrivacy")}
                </Link>
                <Link
                  href="/terms"
                  locale={locale}
                  className={cn(
                    "rounded-sm transition-colors hover:text-foreground",
                    FOCUS_RING,
                  )}
                >
                  {t("linkTerms")}
                </Link>
              </span>
            </div>

            <ul
              className="flex flex-wrap items-center gap-1"
              aria-label={t("sectionSocials")}
            >
              {socialEntries.map((entry) => (
                <li key={entry.key}>
                  <SocialIcon entry={entry} pendingLabel={t("socialPending")} />
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground/80 sm:gap-5 lg:justify-end">
              <span className="hidden xl:inline">{t("techStack")}</span>
              <FooterBackToTop label={t("backToTop")} />
            </div>
          </div>
          {/* Tech stack falls below on narrow viewports so it doesn't
              cramp the icon row. */}
          <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground/70 xl:hidden">
            {t("techStack")}
          </p>
        </div>
      </div>
    </footer>
  );
}
