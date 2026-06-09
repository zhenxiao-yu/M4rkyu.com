import type { ComponentType, ReactNode } from "react";
import { ArrowUpRight, FileText } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { cn, FOCUS_RING } from "@/lib/utils";

export interface FooterSocial {
  key:
    | "email"
    | "github"
    | "devto"
    | "linkedin"
    | "twitter"
    | "instagram";
  label: string;
  href?: string;
  icon: ComponentType<{
    className?: string;
    "aria-hidden"?: boolean | "true" | "false";
  }>;
  pending?: boolean;
}

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
  pending?: boolean;
}

export function SitemapColumn({
  title,
  blurb,
  links,
  locale,
  pendingLabel,
  note,
}: {
  title: string;
  blurb: string;
  links: FooterLink[];
  locale: Locale;
  pendingLabel: string;
  /** Optional muted line under the list — e.g. a "more soon" roadmap. */
  note?: ReactNode;
}) {
  return (
    <nav aria-label={title}>
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.28em] text-foreground/80">
        {title}
      </p>
      <p className="mt-2 max-w-xs text-xs leading-5 text-muted-foreground/85 sm:text-[0.8rem]">
        {blurb}
      </p>
      <ul className="mt-5 flex flex-col gap-0.5">
        {links.map((link) => (
          <li key={`${link.label}-${link.href}`}>
            <FooterLinkRow link={link} locale={locale} pendingLabel={pendingLabel} />
          </li>
        ))}
      </ul>
      {note ? (
        <p className="mt-4 flex items-center gap-1.5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground/55">
          <span aria-hidden="true" className="size-1 rounded-full bg-muted-foreground/40" />
          {note}
        </p>
      ) : null}
    </nav>
  );
}

export function FooterLinkRow({
  link,
  locale,
  pendingLabel,
}: {
  link: FooterLink;
  locale: Locale;
  pendingLabel: string;
}) {
  const className = cn(
    "group inline-flex w-fit items-center gap-2 rounded-md py-1.5 text-sm text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground",
    FOCUS_RING,
  );

  const inner: ReactNode = (
    <>
      <span className="relative">
        {link.label}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current opacity-70 transition-transform duration-(--motion-medium) ease-(--ease-premium) group-hover:scale-x-100"
        />
      </span>
      {link.pending ? (
        <Badge
          variant="outline"
          className="text-[0.5rem] uppercase tracking-[0.18em]"
        >
          {pendingLabel}
        </Badge>
      ) : link.external ? (
        <ArrowUpRight
          className="size-3 text-muted-foreground/70 transition-[opacity,transform,color] duration-(--motion-fast) ease-(--ease-premium) group-hover:text-ring motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      ) : (
        <ArrowUpRight
          className="size-3 opacity-0 transition-[opacity,transform,color] duration-(--motion-fast) ease-(--ease-premium) group-hover:text-ring group-hover:opacity-100 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      )}
    </>
  );

  if (link.pending) {
    return (
      <span className={cn(className, "cursor-default text-muted-foreground/70 hover:text-muted-foreground/80")}>
        <span className="inline-flex items-center gap-2">
          <FileText className="size-3.5 opacity-60" aria-hidden="true" />
          {inner}
        </span>
      </span>
    );
  }

  if (link.external) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link href={link.href} locale={locale} className={className}>
      {inner}
    </Link>
  );
}

export function SocialIcon({
  entry,
  pendingLabel,
}: {
  entry: FooterSocial;
  pendingLabel: string;
}) {
  const { label, href, icon: Icon, pending } = entry;
  const baseClass = cn(
    "group relative grid size-10 place-items-center rounded-full text-muted-foreground transition-[color,background-color,transform] duration-(--motion-fast) ease-(--ease-premium) hover:bg-muted/50 hover:text-foreground motion-safe:hover:-translate-y-0.5",
    FOCUS_RING,
  );

  if (!href || pending) {
    return (
      <span
        className={cn(
          baseClass,
          "cursor-default text-muted-foreground/45 hover:bg-transparent hover:text-muted-foreground/55",
        )}
        title={`${label} · ${pendingLabel}`}
      >
        <Icon className="size-4" aria-hidden="true" />
        <span className="sr-only">
          {label} ({pendingLabel})
        </span>
      </span>
    );
  }

  const isMail = href.startsWith("mailto:");
  return (
    <a
      href={href}
      target={isMail ? undefined : "_blank"}
      rel={isMail ? undefined : "noopener noreferrer"}
      className={baseClass}
      title={label}
    >
      <Icon className="size-4" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </a>
  );
}
