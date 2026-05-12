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
  /** Version label rendered in the title bar. */
  versionLabel?: string;
  className?: string;
}

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
 * Audit pass:
 *   - Dropped the 3-line VT323 ASCII pre-block and the metrics line.
 *     The brief was reading as a dashboard tile; now it's a single
 *     status pulse + version, which is atmospheric instead of
 *     data-dense.
 *   - BorderBeam duration 14s → 7s. The slower trace felt dead;
 *     7s is a quiet light pass that still respects the doctrine's
 *     "one beam in view at once" rule.
 *
 * Live data:
 *   - Pulls the latest dev.to post via the cached `getPosts()` the
 *     header also uses (deduped within a render via React.cache).
 *   - Falls back to "queueing the next post" if no posts are
 *     available — never breaks.
 *
 * All client interactions (tilt, radial) degrade to static under
 * `prefers-reduced-motion`. Server-rendered shell, two thin client
 * islands inside (`BentoTilt` + `CursorRadial`).
 */
export async function CommandHero({
  locale,
  versionLabel = "v2027",
  className,
}: CommandHeroProps) {
  const t = await getTranslations({ locale, namespace: "Home.hero" });
  const tStatus = await getTranslations({ locale, namespace: "Status" });

  const posts = await getPosts();
  const latest = posts[0];
  const hasLatest = Boolean(latest);

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
              duration={7}
              borderRadius={8}
              borderWidth={1.25}
            />

            {/* atmospheric grid substrate, masked to the panel body */}
            <div
              aria-hidden="true"
              className="bg-cyber-grid pointer-events-none absolute inset-0 opacity-20 mask-[radial-gradient(circle_at_center,black,transparent_80%)]"
            />

            <div className="relative flex min-h-40 flex-col items-center justify-center gap-3 py-6">
              <SystemBadge kind="now" label={tStatus("now")} />
              {hasLatest ? (
                <Link
                  href={`/logs/${latest.slug}`}
                  locale={locale}
                  aria-label={`${t("missionBriefShipping")} · ${latest.title}`}
                  className="max-w-56 truncate text-center font-mono text-xs text-muted-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-foreground sm:max-w-64"
                >
                  {t("missionBriefShipping")} · {latest.title}
                </Link>
              ) : (
                <span className="font-mono text-xs text-muted-foreground">
                  {t("missionBriefIdle")}
                </span>
              )}
            </div>
          </PixelPanel>
        </CursorRadial>
      </BentoTilt>
    </BlurFade>
  );
}
