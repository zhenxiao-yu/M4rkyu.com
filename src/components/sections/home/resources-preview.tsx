import { getTranslations } from "next-intl/server";
import { ArrowUpRight, Play } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { ToolIcon } from "@/components/resources/tool-icon";
import { getResourcesSource } from "@/lib/resources/source";
import { HomeSection } from "./home-section";
import { SectionActionLink } from "./section-action-link";
import { SectionBackground } from "./section-background";
import { cn, FOCUS_RING } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";
import type { Resource } from "@/content/schemas";

/** Featured entries lead, then fill from the rest, capped. */
function pick(list: Resource[], count: number): Resource[] {
  return [...list].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, count);
}

/** Bare host for a link's external URL, e.g. "react.dev". */
function host(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

/**
 * Resources entry-point — "the workbench" as one editorial INDEX, not two flat
 * racks. Tools (built, run in-browser) lead with a RUN affordance; links (kept
 * open, external) follow under a thin sub-label with an out-arrow. Each row is
 * catalog-numbered with a hover accent rail — a scannable manifest in the
 * spirit of /work's index ledger, so tools + links read as one field, not boxes.
 */
export async function ResourcesPreview({
  locale,
  embedded = false,
}: {
  locale: Locale;
  embedded?: boolean;
}) {
  const t = await getTranslations({ locale, namespace: "Home.resources" });
  const resources = await getResourcesSource();

  const ready = resources.filter((r) => r.status === "ready");
  const tools = pick(
    ready.filter((r) => r.type === "tool"),
    3,
  );
  const links = pick(
    ready.filter((r) => r.type === "link"),
    3,
  );
  const total = tools.length + links.length;

  return (
    <HomeSection
      embedded={embedded}
      tone="default"
      dataSection="resources"
      background={<SectionBackground variant="circuit" />}
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      lede={t("lede")}
      action={
        <SectionActionLink href="/resources" locale={locale}>
          {t("open")}
        </SectionActionLink>
      }
    >
      <div className="overflow-hidden rounded-xl glass-surface">
        {/* Legend strip — the catalog key + count. */}
        <div className="flex items-center justify-between gap-3 border-b border-border/50 px-4 py-2.5 font-mono text-[0.56rem] uppercase tracking-[0.18em] text-muted-foreground/70 sm:px-5">
          <span className="truncate">
            {t("toolsHint")} · {t("linksHint")}
          </span>
          <span className="shrink-0 tabular-nums">
            {String(total).padStart(2, "0")}
          </span>
        </div>

        <Stagger as="ol" className="flex flex-col divide-y divide-border/40">
          {tools.map((tool, i) => (
            <StaggerItem as="li" key={tool.slug}>
              <ManifestRow
                index={i + 1}
                variant="tool"
                name={tool.name}
                meta={tool.why}
                iconKey={tool.iconKey}
                tags={tool.tags}
                href={`/resources/${tool.slug}`}
                locale={locale}
                runLabel={t("runTool")}
              />
            </StaggerItem>
          ))}

          {links.length > 0 ? (
            <li
              aria-hidden="true"
              className="flex items-center gap-2 bg-muted/10 px-4 py-1.5 font-mono text-[0.54rem] uppercase tracking-[0.2em] text-muted-foreground/55 sm:px-5"
            >
              <span className="size-1 rounded-full bg-muted-foreground/40" />
              {t("linksRack")}
            </li>
          ) : null}

          {links.map((link, i) => (
            <StaggerItem as="li" key={link.slug}>
              <ManifestRow
                index={tools.length + i + 1}
                variant="link"
                name={link.name}
                meta={host(link.link)}
                iconKey={link.iconKey}
                tags={link.tags}
                href={link.link}
                locale={locale}
              />
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </HomeSection>
  );
}

const rowBase =
  "group relative grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 transition-colors duration-(--motion-fast) ease-(--ease-premium) sm:px-5";
const chipActive =
  "grid size-9 shrink-0 place-items-center rounded-md border border-ring/40 bg-ring/[0.06] text-ring transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:border-ring/60";
const chipMuted =
  "grid size-9 shrink-0 place-items-center rounded-md border border-border/60 bg-background/70 text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:border-foreground/40 group-hover:text-foreground";

/** One catalog row — index · icon · name/meta · affordance, with a hover rail. */
function ManifestRow({
  index,
  variant,
  name,
  meta,
  iconKey,
  tags,
  href,
  locale,
  runLabel,
}: {
  index: number;
  variant: "tool" | "link";
  name: string;
  meta: string;
  iconKey?: string;
  tags?: string[];
  href: string;
  locale: Locale;
  runLabel?: string;
}) {
  const isTool = variant === "tool";
  const className = cn(
    rowBase,
    isTool ? "hover:bg-ring/[0.05]" : "hover:bg-foreground/[0.03]",
    FOCUS_RING,
  );
  const inner = (
    <>
      <span
        aria-hidden="true"
        className="absolute inset-y-1.5 left-0 w-0.5 origin-center scale-y-0 rounded-full bg-ring transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover:scale-y-100"
      />
      <span className="font-mono text-[0.7rem] tabular-nums text-muted-foreground/70">
        {String(index).padStart(2, "0")}
      </span>
      <span aria-hidden="true" className={isTool ? chipActive : chipMuted}>
        <ToolIcon iconKey={iconKey} tags={tags} className="size-4" />
      </span>
      <div className="min-w-0">
        <h4 className="truncate font-heading text-sm font-semibold leading-tight">
          {name}
        </h4>
        <p
          className={cn(
            "mt-0.5 truncate text-[0.72rem] leading-snug",
            isTool
              ? "text-muted-foreground"
              : "font-mono lowercase tracking-tight text-muted-foreground/80",
          )}
        >
          {meta}
        </p>
      </div>
      {isTool ? (
        <span className="inline-flex shrink-0 items-center gap-1 rounded border border-ring/30 bg-ring/5 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-ring/90 transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:border-ring/60 group-hover:bg-ring/10">
          <Play className="size-2.5 fill-current" />
          {runLabel}
        </span>
      ) : (
        <ArrowUpRight
          aria-hidden="true"
          className="size-4 shrink-0 text-muted-foreground/45 transition-[color,transform] duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
        />
      )}
    </>
  );

  if (isTool) {
    return (
      <Link href={href} locale={locale} className={className}>
        {inner}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {inner}
    </a>
  );
}
