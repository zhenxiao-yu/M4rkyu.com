import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BentoFx, BentoGrid } from "@/components/about/bento-fx";
import { ToolIcon } from "@/components/resources/tool-icon";
import { getResourcesSource } from "@/lib/resources/source";
import { HomeSection } from "./home-section";
import { cn, FOCUS_RING } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

/**
 * Resources entry-point slide — the in-browser dev tools + the links
 * worth keeping open. Leads with honest counts (a real "dashboard"
 * signal) then a handful of featured cards that open the actual
 * resource. The section CTA drops into the full /resources index.
 */
export async function ResourcesPreview({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Home.resources" });
  const resources = await getResourcesSource();

  const ready = resources.filter((r) => r.status === "ready");
  const toolCount = ready.filter((r) => r.type === "tool").length;
  const linkCount = ready.filter((r) => r.type === "link").length;
  const featured = ready.filter((r) => r.featured);
  const picks = (featured.length > 0 ? featured : ready).slice(0, 6);

  return (
    <HomeSection
      tone="muted"
      dataSection="resources"
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      lede={t("lede")}
      action={
        <Link
          href="/resources"
          locale={locale}
          className={cn(
            "inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-ring",
            FOCUS_RING,
          )}
        >
          {t("open")}
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      }
    >
      {/* Count signal. */}
      <div className="mb-6 flex flex-wrap gap-2">
        {[t("toolsCount", { count: toolCount }), t("linksCount", { count: linkCount })].map(
          (label) => (
            <span
              key={label}
              className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-card/60 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground"
            >
              <span aria-hidden="true" className="size-1.5 rounded-full bg-ring/70" />
              {label}
            </span>
          ),
        )}
      </div>

      <BentoGrid className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {picks.map((resource) => (
          <BentoFx key={resource.slug} pattern="cyber-grid" className="h-full">
            <a
              href={resource.link}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group flex h-full items-start gap-3 rounded-lg glass-surface glass-interactive p-4",
                FOCUS_RING,
              )}
            >
              <span
                aria-hidden="true"
                className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md border border-border/60 bg-background/80 text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:border-ring/50 group-hover:text-foreground"
              >
                <ToolIcon iconKey={resource.iconKey} tags={resource.tags} className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="truncate text-sm font-semibold leading-tight">
                    {resource.name}
                  </h3>
                  <ArrowUpRight
                    aria-hidden="true"
                    className="size-3.5 shrink-0 text-muted-foreground/60 transition-[color,transform] duration-(--motion-fast) ease-(--ease-premium) group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ring"
                  />
                </div>
                <p className="mt-1 line-clamp-2 text-[0.78rem] leading-snug text-muted-foreground">
                  {resource.why || resource.description}
                </p>
              </div>
            </a>
          </BentoFx>
        ))}
      </BentoGrid>
    </HomeSection>
  );
}
