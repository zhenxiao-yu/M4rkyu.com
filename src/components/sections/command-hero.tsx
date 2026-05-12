import * as React from "react";
import { getTranslations } from "next-intl/server";
import { PixelPanel } from "@/components/ui/pixel/pixel-panel";
import { SystemBadge } from "@/components/ui/pixel/system-badge";
import { BlurFade } from "@/components/ui/magic/blur-fade";
import { BorderBeam } from "@/components/ui/magic/border-beam";
import { BentoTilt } from "@/components/ui/magic/bento-tilt";
import { CursorRadial } from "@/components/ui/magic/cursor-radial";
import { Link } from "@/i18n/navigation";
import { getPosts } from "@/lib/blog/get-posts";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

interface CommandHeroProps {
  locale: Locale;
  /**
   * ASCII / VT323 brand mark rendered in the panel body. Defaults to
   * a static M4RKYU.SYS readout. Pass a React node to swap in a
   * custom mark.
   */
  markGlyph?: React.ReactNode;
  /** Version label rendered in the title bar. */
  versionLabel?: string;
  className?: string;
}

const DEFAULT_MARK = `> M4RKYU
> SYSTEM ONLINE
> ENGINEER · ARTIST · DEV`;

/**
 * Mission-brief card on the right side of the hero. Composes three
 * Zentry-inspired tricks layered together:
 *
 *   - `<BentoTilt>` — cursor-relative perspective tilt (Zentry's
 *     `BentoTilt`, scaled down to a 6° max).
 *   - `<CursorRadial>` — cursor-following radial-gradient overlay
 *     (Zentry's `BentoCard` hover-button gradient, scoped to the
 *     full card here).
 *   - `<BorderBeam>` — the doctrine's one-per-viewport animated
 *     border highlight. This card owns the hero's BorderBeam slot.
 *
 * Live data:
 *   - Pulls the latest dev.to post via the cached `getPosts()` the
 *     header also uses (deduped within a render via React.cache).
 *     Renders "currently shipping · {title}" linked to the post.
 *   - Falls back to "queueing the next post" if no posts are
 *     available — never breaks.
 *
 * All client interactions (tilt, radial) degrade to static under
 * `prefers-reduced-motion`. Server-rendered shell, two thin client
 * islands inside (`BentoTilt` + `CursorRadial`).
 */
export async function CommandHero({
  locale,
  markGlyph,
  versionLabel = "v2027",
  className,
}: CommandHeroProps) {
  const t = await getTranslations({ locale, namespace: "Home.hero" });
  const tStatus = await getTranslations({ locale, namespace: "Status" });

  const posts = await getPosts();
  const latest = posts[0];
  const hasLatest = Boolean(latest);

  const metricsLine = t("missionBriefMetrics", {
    posts: posts.length,
  });

  return (
    <BlurFade className={cn("h-full", className)}>
      <BentoTilt className="h-full">
        <CursorRadial className="h-full">
          <PixelPanel
            eyebrow={t("missionBriefTitle")}
            title={versionLabel}
            // The hero owns the page <h1>; this panel header belongs
            // at h3.
            headingLevel={3}
            className="relative h-full overflow-hidden"
          >
            <BorderBeam
              size={140}
              duration={14}
              borderRadius={8}
              borderWidth={1.25}
            />

            {/* atmospheric grid substrate, masked to the panel body */}
            <div
              aria-hidden="true"
              className="bg-cyber-grid pointer-events-none absolute inset-0 opacity-20 mask-[radial-gradient(circle_at_center,black,transparent_80%)]"
            />

            <div className="relative flex min-h-64 flex-col justify-between gap-6 py-4 text-center">
              <pre
                aria-hidden="true"
                className="font-pixel select-none text-base leading-tight text-foreground/85"
              >
                {markGlyph ?? DEFAULT_MARK}
              </pre>

              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center justify-center gap-3">
                  <SystemBadge kind="now" label={tStatus("now")} />
                  {hasLatest ? (
                    <Link
                      href={`/logs/${latest.slug}`}
                      locale={locale}
                      aria-label={`${t("missionBriefShipping")} · ${latest.title}`}
                      className="max-w-[14rem] truncate font-mono text-xs text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground sm:max-w-[16rem]"
                    >
                      {t("missionBriefShipping")} · {latest.title}
                    </Link>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground">
                      {t("missionBriefIdle")}
                    </span>
                  )}
                </div>
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground/80">
                  {metricsLine}
                </p>
              </div>
            </div>
          </PixelPanel>
        </CursorRadial>
      </BentoTilt>
    </BlurFade>
  );
}
