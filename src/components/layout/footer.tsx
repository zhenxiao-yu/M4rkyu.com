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
import { ShinyText } from "@/components/ui/magic/shiny-text";
import { StarGlyph } from "@/components/ui/magic/star-glyph";
import { StatusPulse } from "@/components/ui/pixel/status-pulse";
import { FooterClock } from "./footer-clock";
import { FooterBackToTop } from "./footer-back-to-top";
import { FooterCopyEmail } from "./footer-copy-email";
import { FooterSceneFloor } from "./footer-scene-floor";
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
    { label: t("linkProjects"), href: "/work", iconKey: "Briefcase" },
    { label: t("linkGames"), href: "/games", iconKey: "Gamepad2" },
    { label: t("linkArchive"), href: "/archive", iconKey: "Image" },
    { label: t("linkLogs"), href: "/logs", iconKey: "BookOpen" },
  ];

  // Primary internal resources; the two machine feeds (RSS / JSON) drop into
  // a chip row beneath the list so this column is 7 rows, not a 9-deep waterfall.
  const resourceLinks: FooterLink[] = [
    { label: t("linkSearch"), href: "/search", iconKey: "Search" },
    { label: t("linkLatest"), href: "/latest", iconKey: "Sparkles" },
    { label: t("linkTools"), href: "/resources/tools", iconKey: "Wrench" },
    { label: t("linkLinks"), href: "/resources/links", iconKey: "Link2" },
    { label: t("linkNotes"), href: "/notes", iconKey: "StickyNote" },
    { label: t("linkTopics"), href: "/topics", iconKey: "Hash" },
    { label: t("linkShop"), href: "/shop", iconKey: "Store" },
  ];

  const feedLinks: FooterLink[] = [
    { label: t("linkRss"), href: "/feed.xml", external: true, iconKey: "Rss" },
    { label: t("linkJsonFeed"), href: "/feed.json", external: true, iconKey: "Braces" },
  ];

  const studioLinks: FooterLink[] = [
    { label: t("linkAbout"), href: "/about", iconKey: "User" },
    { label: t("linkContact"), href: "/contact", iconKey: "Mail" },
    { label: t("linkChangelog"), href: "/changelog", iconKey: "History" },
    { label: t("linkColophon"), href: "/colophon", iconKey: "FileText" },
    resumeReady && resumeHref
      ? { label: t("linkResume"), href: resumeHref, external: true, iconKey: "FileText" }
      : { label: t("linkResume"), href: "/about", pending: true, iconKey: "FileText" },
  ];

  // "Elsewhere" column — only channels that actually resolve, rendered
  // as real external links. The platforms still to come collapse into a
  // single honest "soon" line (`socialSoon`) instead of a column of dead
  // placeholder rows, which read as unfinished.
  const githubHref = socials.github ?? "https://github.com/zhenxiao-yu";
  const socialColumnLinks: FooterLink[] = [
    { label: t("socialGithub"), href: githubHref, external: true, iconKey: "Code2" },
    ...(socials.devto
      ? [{ label: t("socialDevto"), href: socials.devto, external: true, iconKey: "AtSign" } as FooterLink]
      : []),
    ...(socials.linkedin
      ? [{ label: t("socialLinkedin"), href: socials.linkedin, external: true, iconKey: "Briefcase" } as FooterLink]
      : []),
    ...(socials.twitter
      ? [{ label: t("socialTwitter"), href: socials.twitter, external: true, iconKey: "MessageCircle" } as FooterLink]
      : []),
    ...(socials.instagram
      ? [
          {
            label: t("socialInstagram"),
            href: socials.instagram,
            external: true,
            iconKey: "Camera",
          } as FooterLink,
        ]
      : []),
    ...(socials.facebook
      ? [{ label: t("socialFacebook"), href: socials.facebook, external: true, iconKey: "ThumbsUp" } as FooterLink]
      : []),
    ...(socials.youtube
      ? [{ label: t("socialYoutube"), href: socials.youtube, external: true, iconKey: "PlaySquare" } as FooterLink]
      : []),
    ...(socials.codepen
      ? [{ label: t("socialCodepen"), href: socials.codepen, external: true, iconKey: "SquareCode" } as FooterLink]
      : []),
    ...(socials.spotify
      ? [{ label: t("socialSpotify"), href: socials.spotify, external: true, iconKey: "Music2" } as FooterLink]
      : []),
    ...(socials.snapchat
      ? [{ label: t("socialSnapchat"), href: socials.snapchat, external: true, iconKey: "Ghost" } as FooterLink]
      : []),
    { label: t("socialEmail"), href: `mailto:${profile.email}`, external: true, iconKey: "Mail" },
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
    // Editorial footer — runs top-to-bottom as: contact cluster · sitemap ·
    // scene-floor wordmark · baseline rail, all inside a single max-w-page
    // column so the rhythm reads like end credits rather than a SaaS
    // hand-off. The contact cluster is asymmetric on purpose — the
    // invitation (oversized click-to-copy email) anchors left, a compact
    // "currently" card (status · local time · channels) sits right.
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
        {/* 1. Contact cluster — invitation left (7), a load-bearing hairline
            divider (1) that turns the dead center gutter into a deliberate
            Swiss column rule, "currently" card right (4). items-stretch +
            mt-auto on the social rail lands both columns on one bottom line. */}
        <section className="grid gap-12 py-16 sm:py-20 lg:grid-cols-12 lg:items-stretch lg:gap-x-8 lg:gap-y-0 lg:py-24">
          <div className="flex flex-col items-start gap-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.28em] text-muted-foreground">
              <StarGlyph className="size-2.5 text-ring" />
              {t("eyebrow")}
            </div>
            <h2 className="font-display text-4xl font-semibold leading-[1.04] tracking-tight text-balance sm:text-5xl lg:text-6xl">
              <span className="block">{t("headlinePrimary")}</span>
              <span className="block text-muted-foreground/90">
                <ShinyText duration={5}>{t("headlineSecondary")}</ShinyText>
              </span>
            </h2>
            <FooterCopyEmail
              email={profile.email}
              copyLabel={t("emailCopy")}
              copiedLabel={t("emailCopied")}
            />
            <p className="max-w-xl text-sm leading-6 text-muted-foreground text-balance sm:text-base sm:leading-7">
              <span className="font-medium text-foreground">
                {t("metaResponse")}
              </span>{" "}
              · {t("metaAvailability")}
            </p>
            <Link
              href="/contact"
              locale={locale}
              className={cn(
                "group mt-1 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground",
                FOCUS_RING,
              )}
            >
              {t("ctaConversation")}
              <ArrowUpRight
                className="size-3.5 transition-transform duration-(--motion-fast) ease-(--ease-premium) motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </div>

          {/* Hairline divider cell — the fix for the empty middle: a full-height
              centered rule instead of a void. Vanishes below lg. */}
          <div
            aria-hidden="true"
            className="hidden lg:col-span-1 lg:flex lg:justify-center"
          >
            <span className="h-full w-px bg-border" />
          </div>

          {/* "Currently" card — status, local time, channels */}
          <aside className="flex flex-col gap-5 lg:col-span-4 lg:items-end lg:text-right">
            <div className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
              <StatusPulse tone="now" />
              <span className="text-foreground/80">{t("statusOpen")}</span>
            </div>
            <p className="max-w-[24ch] font-mono text-[0.65rem] uppercase leading-5 tracking-[0.18em] text-muted-foreground/80">
              {t("statusAccepting", { year })}
            </p>
            <FooterClock label={t("localTimeLabel")} />
            <span className="inline-flex items-center gap-1.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              <MapPin className="size-3 opacity-70" aria-hidden="true" />
              {t("locationLine")}
            </span>
            <ul
              className="flex flex-wrap items-center gap-1.5 lg:mt-auto lg:justify-end"
              aria-label={t("sectionSocials")}
            >
              {socialEntries.map((entry) => (
                <li key={entry.key}>
                  <SocialIcon entry={entry} pendingLabel={t("socialPending")} />
                </li>
              ))}
            </ul>
          </aside>
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

        {/* 3. Sitemap — four editorial index columns: icon-led rows under a
            mono title + blurb, separated by a Swiss hairline rule at lg */}
        <div className="grid gap-x-8 gap-y-10 border-t py-12 sm:grid-cols-2 lg:grid-cols-4">
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
            feedLinks={feedLinks}
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

        {/* 4. Scene floor — oversized wordmark + orbiting moon, lifts on scroll */}
        <FooterSceneFloor
          locale={locale}
          name={profile.name}
          sinceLabel={t("wordmarkSince")}
        />

        {/* 5. Baseline rail — copyright, legal, tech, back-to-top. Status +
            channels now live up in the contact cluster, so this stays slim. */}
        <div className="border-t py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground sm:flex-row sm:items-center sm:gap-3">
              <span className="text-foreground/80">
                © {year} {profile.name}
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

            <div className="flex flex-wrap items-center gap-4 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground/80 sm:justify-end sm:gap-5">
              <span className="hidden lg:inline">{t("techStack")}</span>
              <FooterBackToTop label={t("backToTop")} />
            </div>
          </div>
          {/* Tech stack drops below on narrow viewports. */}
          <p className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground/70 lg:hidden">
            {t("techStack")}
          </p>
        </div>
      </div>
    </footer>
  );
}
