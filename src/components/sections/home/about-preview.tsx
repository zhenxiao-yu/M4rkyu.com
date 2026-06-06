import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { FadeIn } from "@/components/motion/fade-in";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { profile } from "@/content/profile";
import { HomeSection } from "./home-section";
import { SectionBackground } from "./section-background";
import { cn, FOCUS_RING } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";

const FOCAL: Record<string, string> = {
  top: "center top",
  center: "center",
  bottom: "center bottom",
};

/**
 * About entry-point slide — portrait first, copy second. Deliberately
 * minimal and low-maintenance: a framed portrait (the real photo the
 * moment `profile.portrait` is set, a placeholder until then) plus the
 * heading, one lede line, and the link into /about. No hand-tended feeds
 * or stats — everything here is stable content. Stacks to one snap
 * viewport on mobile with the face leading.
 */
export async function AboutPreview({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Home.aboutPreview" });
  const portrait = profile.portrait;

  return (
    <HomeSection
      tone="default"
      dataSection="about-preview"
      background={<SectionBackground variant="contour" />}
    >
      <div className="grid items-center gap-8 md:grid-cols-[1fr_0.9fr] lg:gap-14">
        {/* Portrait — the visual. Capped width so the section still snaps
          * to a single viewport on mobile; leads on mobile (order-first),
          * sits right on desktop. */}
        <FadeIn direction="left" delay={0.05} className="md:order-last">
          <figure className="mx-auto w-full max-w-60 overflow-hidden rounded-xl border border-border/60 bg-card/30 shadow-lg shadow-black/5 dark:shadow-black/20 sm:max-w-68 md:max-w-sm">
            {portrait ? (
              <div className="relative aspect-4/5 w-full overflow-hidden">
                <Image
                  src={portrait.src}
                  alt={portrait.alt}
                  fill
                  sizes="(max-width: 768px) 70vw, 24rem"
                  className="object-cover grayscale transition duration-500 ease-(--ease-premium) hover:grayscale-0"
                  style={{ objectPosition: FOCAL[portrait.focal] ?? "center" }}
                />
              </div>
            ) : (
              <PlaceholderImage label={t("portraitLabel")} aspect="aspect-4/5" />
            )}
            <figcaption className="flex items-center justify-between gap-2 border-t border-border/50 px-3 py-2 font-mono text-[0.58rem] uppercase tracking-[0.16em] text-muted-foreground">
              <span className="truncate text-foreground/80">{profile.name}</span>
              <span className="shrink-0">{profile.location}</span>
            </figcaption>
          </figure>
        </FadeIn>

        {/* Copy — minimal. */}
        <FadeIn className="max-w-xl">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {t("eyebrow")}
          </p>
          <h2 className="mt-4 font-heading text-balance text-3xl font-semibold leading-[1.04] tracking-tight sm:text-4xl lg:text-5xl">
            {t("heading")}
          </h2>
          <p className="mt-5 text-base leading-7 text-foreground/85">
            {t("lede")}
          </p>
          <Link
            href="/about"
            locale={locale}
            className={cn(
              "mt-7 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-ring",
              FOCUS_RING,
            )}
          >
            {t("open")}
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </Link>
        </FadeIn>
      </div>
    </HomeSection>
  );
}
