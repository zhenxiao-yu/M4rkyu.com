import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { cn, FOCUS_RING } from "@/lib/utils";

/**
 * The shared "→ open the full thing" link every home section hangs in its
 * header `action` slot (and one or two body CTAs). It was inlined and
 * drifting across eight sections; one component now owns the mono-caps
 * treatment, the focus ring, and the arrow's nudge-on-hover micro-
 * interaction. The nudge is `motion-safe`, so reduced-motion and touch get
 * a static arrow. Pass `className` for the rare hover-accent override (the
 * games slide tints to `--game-accent`) or for a body CTA's top margin.
 */
export function SectionActionLink({
  href,
  locale,
  children,
  className,
}: {
  href: string;
  locale: Locale;
  children: ReactNode;
  /** Accent or spacing override (cn-merged after the base, before the ring). */
  className?: string;
}) {
  return (
    <Link
      href={href}
      locale={locale}
      className={cn(
        "group inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-ring",
        className,
        FOCUS_RING,
      )}
    >
      {children}
      <ArrowUpRight
        aria-hidden="true"
        className="size-3.5 transition-transform duration-(--motion-fast) ease-(--ease-premium) motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
      />
    </Link>
  );
}
