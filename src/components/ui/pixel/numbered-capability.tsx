import * as React from "react";
import { BlurFade } from "@/components/ui/magic/blur-fade";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface NumberedCapabilityProps {
  /** Mono numerical index (e.g. "01"). Rendered in VT323, decorative. */
  index: string;
  /** Capability headline — rendered as <h3> in the document outline. */
  title: string;
  /** 1–2 sentence body description in Geist. */
  description: string;
  /** Optional tech / discipline tag chips. Stays canonical English across locales. */
  tags?: readonly string[];
  /** Optional link target. When present, the title becomes the link surface. */
  cta?: { label: string; href: string };
  /** Optional small visual rendered in the right slot at md+. */
  visual?: React.ReactNode;
  className?: string;
}

export function NumberedCapability({
  index,
  title,
  description,
  tags,
  cta,
  visual,
  className,
}: NumberedCapabilityProps) {
  // Always render the title inside an `<h3>` so the document outline
  // stays well-formed regardless of whether a CTA is supplied. The
  // <Link> nests inside the h3 when `cta` is present.
  const titleNode = (
    <h3 className="font-display text-2xl font-extrabold leading-tight sm:text-3xl">
      {cta ? (
        <Link
          href={cta.href}
          aria-label={cta.label}
          className="group/cta relative inline-block w-fit text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground/85"
        >
          <span>{title}</span>
          {/* Underline-from-left reveal — `scale-x` on transform keeps the
            * animation inside the default `transition` property set so no
            * arbitrary `transition-[width]` syntax is needed. */}
          <span
            aria-hidden="true"
            className="block h-px origin-left scale-x-0 bg-foreground transition duration-(--motion-fast) ease-(--ease-premium) group-hover/cta:scale-x-100"
          />
        </Link>
      ) : (
        title
      )}
    </h3>
  );

  return (
    <BlurFade>
      <article
        className={cn(
          "grid grid-cols-1 gap-4 py-10 md:grid-cols-[5rem_1fr_auto] md:gap-10 md:py-12",
          className,
        )}
      >
        <span
          aria-hidden="true"
          className="font-pixel text-2xl leading-none text-muted-foreground md:pt-2 md:text-3xl"
        >
          {index}
        </span>
        <div className="flex flex-col gap-3">
          {titleNode}
          <p className="max-w-prose text-base leading-7 text-muted-foreground">
            {description}
          </p>
          {tags && tags.length > 0 ? (
            <ul className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-sm border border-border bg-card px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-muted-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {visual ? (
          <div className="self-start md:max-w-[18rem]">{visual}</div>
        ) : null}
      </article>
    </BlurFade>
  );
}
