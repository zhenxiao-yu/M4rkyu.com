import type { ComponentType, ReactNode } from "react";
import {
  ArrowUpRight,
  AtSign,
  Briefcase,
  Camera,
  Code2,
  FileText,
  Mail,
  MapPin,
  MessageCircle,
  Send,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { profile } from "@/content/profile";
import { Badge } from "@/components/ui/badge";
import { DotGrid } from "@/components/ui/magic/dot-grid";
import { ShineBorder } from "@/components/ui/magic/shine-border";
import { StatusPulse } from "@/components/ui/pixel/status-pulse";
import { cn, FOCUS_RING } from "@/lib/utils";

interface SocialEntry {
  label: string;
  href?: string;
  icon: ComponentType<{
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
  }>;
  pending?: boolean;
}

const workLinks = [
  { label: "Projects", href: "/work" },
  { label: "Games", href: "/games" },
  { label: "Archive", href: "/archive" },
  { label: "Logs", href: "/logs" },
  { label: "Resources", href: "/resources" },
] as const;

const systemLinks = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

function isPublishedResume(href?: string) {
  if (!href) return false;
  // Local /public PDFs stay pending; only external URLs count as live.
  return !href.startsWith("/");
}

export function Footer({ locale }: { locale: Locale }) {
  const socials = profile.socials ?? {};
  const resumeHref = profile.resumeUrl;
  const resumeReady = isPublishedResume(resumeHref);

  const socialEntries: SocialEntry[] = [
    { label: "Email", href: `mailto:${profile.email}`, icon: Mail },
    { label: "GitHub", href: socials.github, icon: Code2 },
    { label: "dev.to", href: socials.devto, icon: AtSign },
    {
      label: "LinkedIn",
      href: socials.linkedin,
      icon: Briefcase,
      pending: !socials.linkedin,
    },
    {
      label: "Twitter / X",
      href: socials.twitter,
      icon: MessageCircle,
      pending: !socials.twitter,
    },
    {
      label: "Instagram",
      href: socials.instagram,
      icon: Camera,
      pending: !socials.instagram,
    },
  ];

  return (
    <footer className="relative isolate overflow-hidden border-t bg-background">
      <div
        className="absolute inset-0 bg-cyber-grid opacity-20"
        aria-hidden="true"
      />
      <DotGrid
        className="pointer-events-none absolute inset-0 opacity-30 [mask-image:linear-gradient(to_top,black,transparent_78%)]"
        spacing={36}
        baseDotSize={1}
        hoverDotSize={3.2}
        influenceRadius={150}
        baseOpacity={0.1}
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        <div className="relative overflow-hidden rounded-lg border bg-card/75 shadow-sm backdrop-blur-xl">
          <ShineBorder borderRadius={8} duration={18} />
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.1fr_auto] lg:items-center lg:p-7">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border bg-background/65 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
                <StatusPulse tone="now" />
                Open channel
              </div>
              <h2 className="mt-4 max-w-2xl font-heading text-2xl font-semibold leading-tight tracking-normal sm:text-3xl">
                Software, games, visual systems, and careful interfaces.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
                Based in {profile.location}. Building production web apps,
                playable systems, and quiet visual archives with a bias toward
                clarity and craft.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              <FooterButton href={`mailto:${profile.email}`} icon={Send}>
                Email Mark
              </FooterButton>
              <FooterButton
                href="/contact"
                locale={locale}
                icon={ArrowUpRight}
                variant="secondary"
              >
                Send a brief
              </FooterButton>
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr_1fr_1fr] lg:gap-12">
          <div>
            <Link
              href="/"
              locale={locale}
              className={cn("group inline-flex items-center gap-3 rounded-lg", FOCUS_RING)}
            >
              <span className="grid size-10 place-items-center rounded-lg border bg-foreground text-background text-sm font-bold tracking-normal shadow-sm transition-transform duration-(--motion-fast) ease-(--ease-premium) motion-safe:group-hover:scale-105">
                M4
              </span>
              <span>
                <span className="block font-mono text-sm font-semibold uppercase tracking-[0.18em]">
                  M4rkyu.com
                </span>
                <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin className="size-3" aria-hidden="true" />
                  {profile.location}
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-muted-foreground">
              {profile.title}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {resumeReady && resumeHref ? (
                <a
                  href={resumeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "inline-flex min-h-10 items-center gap-2 rounded-md border bg-background/55 px-3 py-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-foreground transition-[border-color,color,transform] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring hover:text-ring motion-safe:hover:-translate-y-0.5",
                    FOCUS_RING,
                  )}
                >
                  <FileText className="size-3.5" aria-hidden="true" />
                  Resume / CV
                  <ArrowUpRight className="size-3" aria-hidden="true" />
                </a>
              ) : (
                <span className="inline-flex min-h-10 items-center gap-2 rounded-md border border-dashed bg-background/35 px-3 py-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
                  <FileText className="size-3.5" aria-hidden="true" />
                  Resume / CV
                  <Badge
                    variant="outline"
                    className="text-[0.55rem] tracking-[0.18em]"
                  >
                    pending
                  </Badge>
                </span>
              )}
            </div>
          </div>

          <FooterNavGroup title="Explore" links={workLinks} locale={locale} />
          <FooterNavGroup title="System" links={systemLinks} locale={locale} />
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {socialEntries.map(({ label, href, icon: Icon, pending }) => (
            <SocialLink
              key={label}
              href={href}
              label={label}
              icon={Icon}
              pending={pending}
            />
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t pt-6 font-mono text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {profile.name} · M4rkyu.com
          </p>
          <p>Built with Next.js 16 · React 19 · Tailwind 4</p>
        </div>
      </div>
    </footer>
  );
}

function FooterNavGroup({
  title,
  links,
  locale,
}: {
  title: string;
  links: readonly { label: string; href: string }[];
  locale: Locale;
}) {
  return (
    <nav aria-label={title}>
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
        {title}
      </p>
      <ul className="mt-4 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
        {links.map(({ label, href }) => (
          <li key={href}>
            <Link
              href={href}
              locale={locale}
              className={cn(
                "group flex min-h-10 items-center justify-between gap-3 rounded-md border border-transparent px-3 py-2 text-sm text-muted-foreground transition-[background-color,border-color,color,transform] duration-(--motion-fast) ease-(--ease-premium) hover:border-border hover:bg-card/65 hover:text-foreground motion-safe:hover:translate-x-1",
                FOCUS_RING,
              )}
            >
              {label}
              <ArrowUpRight
                className="size-3.5 opacity-0 transition-[opacity,transform,color] duration-(--motion-fast) ease-(--ease-premium) group-hover:text-ring group-hover:opacity-100 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function FooterButton({
  href,
  locale,
  icon: Icon,
  variant = "primary",
  children,
}: {
  href: string;
  locale?: Locale;
  icon: ComponentType<{
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
  }>;
  variant?: "primary" | "secondary";
  children: ReactNode;
}) {
  const className = cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-[background-color,border-color,color,box-shadow,transform] duration-(--motion-fast) ease-(--ease-premium) motion-safe:hover:-translate-y-0.5",
    FOCUS_RING,
    variant === "primary"
      ? "border-primary bg-primary text-primary-foreground shadow-sm hover:bg-primary/90"
      : "border-border bg-background/65 text-foreground hover:border-ring hover:text-ring",
  );

  if (href.startsWith("mailto:")) {
    return (
      <a href={href} className={className}>
        <Icon className="size-4" aria-hidden="true" />
        {children}
      </a>
    );
  }

  return (
    <Link href={href} locale={locale} className={className}>
      <Icon className="size-4" aria-hidden="true" />
      {children}
    </Link>
  );
}

function SocialLink({
  href,
  label,
  icon: Icon,
  pending,
}: {
  href?: string;
  label: string;
  icon: ComponentType<{
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
  }>;
  pending?: boolean;
}) {
  const className = cn(
    "group flex min-h-12 items-center justify-between gap-3 rounded-lg border bg-card/55 px-3 py-2 text-sm transition-[background-color,border-color,color,box-shadow,transform] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/70 hover:bg-card hover:text-foreground hover:shadow-sm motion-safe:hover:-translate-y-0.5",
    FOCUS_RING,
  );

  const content = (
    <>
      <span className="flex items-center gap-2 text-muted-foreground transition-colors group-hover:text-foreground">
        <Icon className="size-4" aria-hidden="true" />
        {label}
      </span>
      {pending ? (
        <Badge variant="outline" className="text-[0.55rem] tracking-[0.18em]">
          tbd
        </Badge>
      ) : (
        <ArrowUpRight
          className="size-3.5 text-muted-foreground opacity-0 transition-[opacity,transform,color] duration-(--motion-fast) ease-(--ease-premium) group-hover:text-ring group-hover:opacity-100 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      )}
    </>
  );

  if (!href) {
    return (
      <span className="flex min-h-12 items-center justify-between gap-3 rounded-lg border border-dashed bg-card/35 px-3 py-2 text-sm text-muted-foreground/60">
        {content}
      </span>
    );
  }

  return (
    <a
      href={href}
      target={href.startsWith("mailto:") ? undefined : "_blank"}
      rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
      className={className}
    >
      {content}
    </a>
  );
}
