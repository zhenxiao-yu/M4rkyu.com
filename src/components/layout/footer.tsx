import { Code2, Mail, FileText, Briefcase, Camera, AtSign, MessageCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { profile } from "@/content/profile";
import { Badge } from "@/components/ui/badge";
import { AsciiText } from "@/components/ui/magic/ascii-text";

const ASCII_WORDMARK = String.raw`
███╗   ███╗██╗  ██╗██████╗ ██╗  ██╗██╗   ██╗██╗   ██╗
████╗ ████║██║  ██║██╔══██╗██║ ██╔╝╚██╗ ██╔╝██║   ██║
██╔████╔██║███████║██████╔╝█████╔╝  ╚████╔╝ ██║   ██║
██║╚██╔╝██║╚════██║██╔══██╗██╔═██╗   ╚██╔╝  ██║   ██║
██║ ╚═╝ ██║     ██║██║  ██║██║  ██╗   ██║   ╚██████╔╝
╚═╝     ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝
`;

interface SocialEntry {
  label: string;
  href?: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
  pending?: boolean;
}

export function Footer({ locale }: { locale: Locale }) {
  const socials = profile.socials ?? {};

  const socialEntries: SocialEntry[] = [
    { label: "Email", href: `mailto:${profile.email}`, icon: Mail },
    { label: "GitHub", href: socials.github, icon: Code2 },
    { label: "dev.to", href: socials.devto, icon: AtSign },
    { label: "LinkedIn", href: socials.linkedin, icon: Briefcase, pending: !socials.linkedin },
    { label: "Twitter / X", href: socials.twitter, icon: MessageCircle, pending: !socials.twitter },
    { label: "Instagram", href: socials.instagram, icon: Camera, pending: !socials.instagram },
  ];

  const resumeHref = profile.resumeUrl;

  return (
    <footer className="relative overflow-hidden border-t">
      {/* Decorative ASCII wordmark behind the footer body. aria-hidden so
        * screen readers don't read 100 box-drawing characters; the visible
        * brand label below carries the accessible name. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 hidden justify-center md:flex">
        <AsciiText art={ASCII_WORDMARK} className="text-foreground/8 dark:text-foreground/12" />
      </div>
      <div className="relative mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.2fr_auto_auto]">
          {/* brand */}
          <div>
            <div className="flex items-center gap-3">
              <span className="grid size-8 place-items-center rounded-md border bg-foreground text-background text-xs font-bold tracking-tight">
                M4
              </span>
              <span className="font-mono text-sm font-semibold tracking-wide">
                M4rkyu.com
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-6 text-muted-foreground">
              {profile.title}. {profile.location}.
            </p>
            {resumeHref ? (
              <a
                href={resumeHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs font-mono uppercase tracking-[0.18em] text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring hover:text-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <FileText className="size-3.5" aria-hidden="true" />
                Résumé / CV
                <Badge variant="outline" className="ml-1 text-[0.55rem] tracking-[0.2em]">
                  pending
                </Badge>
              </a>
            ) : null}
          </div>

          {/* work */}
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
              Work
            </p>
            <ul className="mt-4 grid gap-3 text-sm">
              {[
                { label: "Projects", href: "/work" },
                { label: "Games", href: "/games" },
                { label: "Gallery", href: "/archive" },
                { label: "Writing", href: "/logs" },
                { label: "Resources", href: "/resources" },
              ].map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    locale={locale}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* connect */}
          <div>
            <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
              Connect
            </p>
            <ul className="mt-4 grid gap-3 text-sm">
              {socialEntries.map(({ label, href, icon: Icon, pending }) => (
                <li key={label}>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith("mailto:") ? undefined : "_blank"}
                      rel={href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                      className="inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <Icon className="size-3.5" aria-hidden="true" />
                      {label}
                    </a>
                  ) : (
                    <span
                      className="inline-flex items-center gap-2 text-muted-foreground/50"
                      title="Handle not yet wired"
                    >
                      <Icon className="size-3.5" aria-hidden="true" />
                      {label}
                      {pending ? (
                        <Badge variant="outline" className="ml-1 text-[0.5rem] tracking-[0.18em]">
                          tbd
                        </Badge>
                      ) : null}
                    </span>
                  )}
                </li>
              ))}
              <li>
                <Link
                  href="/about"
                  locale={locale}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  locale={locale}
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            © {new Date().getFullYear()} {profile.name} — M4rkyu.com
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            Built with Next.js 16 · {profile.location}
          </p>
        </div>
      </div>
    </footer>
  );
}
