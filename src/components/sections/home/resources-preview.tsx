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
 * Resources entry-point slide — "the workbench". The catalog splits in
 * two and the section honours that split instead of flattening it into a
 * uniform tile grid: a rack of TOOLS I built (interactive, served from
 * /resources/[slug]) beside a rack of LINKS I keep open (external). Tools
 * wear an accent chip + a RUN affordance and link inward to the
 * in-browser tool; links stay muted, show their host, and open out.
 *
 * Counts in each rack header are the honest catalog totals; the section
 * CTA opens the full /resources index.
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
  const tools = ready.filter((r) => r.type === "tool");
  const links = ready.filter((r) => r.type === "link");

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
      <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
        {/* Rack A — tools I built. */}
        <Rack label={t("toolsRack")} hint={t("toolsHint")} count={tools.length}>
          {pick(tools, 3).map((tool, index) => (
            <StaggerItem as="li" key={tool.slug}>
              <Link
                href={`/resources/${tool.slug}`}
                locale={locale}
                className={cn(rowBase, index > 0 && rowDivide, "hover:bg-ring/[0.05]", FOCUS_RING)}
              >
                <span aria-hidden="true" className={chipActive}>
                  <ToolIcon iconKey={tool.iconKey} tags={tool.tags} className="size-4" />
                </span>
                <div className="min-w-0">
                  <h4 className="truncate font-heading text-sm font-semibold leading-tight">
                    {tool.name}
                  </h4>
                  <p className="mt-0.5 line-clamp-1 text-[0.72rem] leading-snug text-muted-foreground">
                    {tool.why}
                  </p>
                </div>
                <span
                  aria-hidden="true"
                  className="inline-flex shrink-0 items-center gap-1 rounded border border-ring/30 bg-ring/5 px-1.5 py-0.5 font-mono text-[0.55rem] uppercase tracking-[0.14em] text-ring/90 transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:border-ring/60 group-hover:bg-ring/10"
                >
                  <Play className="size-2.5 fill-current" />
                  {t("runTool")}
                </span>
              </Link>
            </StaggerItem>
          ))}
        </Rack>

        {/* Rack B — links I keep open. */}
        <Rack label={t("linksRack")} hint={t("linksHint")} count={links.length}>
          {pick(links, 3).map((link, index) => (
            <StaggerItem as="li" key={link.slug}>
              <a
                href={link.link}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(rowBase, index > 0 && rowDivide, "hover:bg-foreground/[0.03]", FOCUS_RING)}
              >
                <span aria-hidden="true" className={chipMuted}>
                  <ToolIcon iconKey={link.iconKey} tags={link.tags} className="size-4" />
                </span>
                <div className="min-w-0">
                  <h4 className="truncate font-heading text-sm font-semibold leading-tight">
                    {link.name}
                  </h4>
                  <p className="mt-0.5 truncate font-mono text-[0.68rem] lowercase tracking-tight text-muted-foreground/80">
                    {host(link.link)}
                  </p>
                </div>
                <ArrowUpRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground/45 transition-[color,transform] duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground"
                />
              </a>
            </StaggerItem>
          ))}
        </Rack>
      </div>
    </HomeSection>
  );
}

const rowBase =
  "group grid grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-3 transition-colors duration-(--motion-fast) ease-(--ease-premium) sm:px-5";
const rowDivide = "border-t border-border/40";
const chipActive =
  "grid size-9 shrink-0 place-items-center rounded-md border border-ring/40 bg-ring/[0.06] text-ring transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:border-ring/60";
const chipMuted =
  "grid size-9 shrink-0 place-items-center rounded-md border border-border/60 bg-background/70 text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:border-foreground/40 group-hover:text-foreground";

/** One labelled rack — frosted panel, equipment-style header, row list. */
function Rack({
  label,
  hint,
  count,
  children,
}: {
  label: string;
  hint: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col self-start overflow-hidden rounded-xl glass-surface">
      <header className="flex items-center justify-between border-b border-border/50 px-4 py-3 sm:px-5">
        <div className="flex items-baseline gap-2.5">
          <h3 className="font-heading text-sm font-semibold uppercase tracking-[0.12em]">
            {label}
          </h3>
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground/70">
            {hint}
          </span>
        </div>
        <span className="font-mono text-[0.62rem] tabular-nums text-muted-foreground">
          {String(count).padStart(2, "0")}
        </span>
      </header>
      <Stagger as="ul" className="flex flex-col">
        {children}
      </Stagger>
    </section>
  );
}
