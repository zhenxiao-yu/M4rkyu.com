"use client";

import { Mail, Code2, ArrowRight, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { Magnet } from "@/components/ui/magic/magnet";
import { RotatingText } from "@/components/ui/magic/rotating-text";
import { Waves } from "@/components/ui/magic/waves";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { profile } from "@/content/profile";

interface LetsBuildCtaProps {
  locale: Locale;
}

/**
 * Closing call-to-action. v2 (clean rewrite):
 *
 *   The previous version tried to port wodniack's "Let's Rock"
 *   expanding-circle modal — central tap target opens a clip-path
 *   reveal of 3 buttons. In practice that pattern hid the primary
 *   actions until you discovered the button, and "tap me" copy felt
 *   trying. Replaced with a single clean closing strip:
 *
 *     - Big headline with a rotating verb ("Let's build/ship/make...")
 *     - One body line
 *     - 3 inline buttons (email, GitHub, send-a-brief)
 *     - Decorative floating stars in the background
 *     - Magnet on the headline-only for atmosphere (not on CTAs —
 *       button drift makes click targets miss)
 */
export function LetsBuildCta({ locale }: LetsBuildCtaProps) {
  const t = useTranslations("Home.letsBuild");
  const githubHref = profile.socials?.github ?? "https://github.com/zhenxiao-yu";

  return (
    <section
      data-snap="section"
      className="relative isolate flex min-h-dvh flex-col justify-center overflow-hidden border-y bg-background py-28 sm:py-36"
    >
      {/* Waves backdrop — ReactBits port. Perlin-noise field of
        * curved lines with mouse repulsion, theme-reactive line color
        * (re-reads --foreground on theme flip). Sits at -z-20 so the
        * spotlight gradient + decorative stars layer over it. */}
      <div aria-hidden="true" className="absolute inset-0 -z-20 opacity-60 dark:opacity-45">
        <Waves
          xGap={16}
          yGap={42}
          waveAmpX={26}
          waveAmpY={12}
          friction={0.93}
          tension={0.006}
        />
      </div>
      <FloatingStars />
      {/* Soft radial spotlight behind the headline. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background:radial-gradient(circle_at_50%_40%,color-mix(in_srgb,var(--ring)_18%,transparent),transparent_60%)]"
      />

      <div className="relative mx-auto w-full max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {t("eyebrow")}
        </p>
        <h2 className="mt-6 font-heading text-balance text-5xl font-semibold leading-[0.95] sm:text-6xl lg:text-7xl">
          <Magnet strength={6} radius={140}>
            <span className="inline-block">
              {t("letsLabel")}{" "}
              <RotatingText
                words={[t("verb1"), t("verb2"), t("verb3"), t("verb4")]}
                className="text-ring"
              />
            </span>
          </Magnet>
        </h2>
        <p className="mx-auto mt-6 max-w-lg text-base leading-7 text-muted-foreground">
          {t("body")}
        </p>

        {/* CTA cluster. Below sm the buttons stack full-width so each
          * primary action is a comfortable tap target on phones; from
          * sm up they wrap inline with breathing room. */}
        <div className="mt-10 flex flex-col items-stretch justify-center gap-2.5 sm:mt-12 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <Button asChild variant="default" size="lg" className="w-full sm:w-auto">
            <a href={`mailto:${profile.email}`}>
              <Mail className="size-4" aria-hidden="true" />
              {t("emailDirect")}
            </a>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <a href={githubHref} target="_blank" rel="noopener noreferrer">
              <Code2 className="size-4" aria-hidden="true" />
              GitHub
            </a>
          </Button>
          <Button asChild variant="ghost" size="lg" className="w-full sm:w-auto">
            <Link href="/contact" locale={locale}>
              {t("sendBrief")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/**
 * Decorative drifting stars. 4 SVG stars with staggered animation
 * delays so the loop reads as organic. Hidden below sm so the mobile
 * CTA stays clean.
 */
function FloatingStars() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden sm:block">
      {[
        { top: "12%", left: "8%", delay: "0s", size: 26 },
        { top: "22%", right: "10%", delay: "2.1s", size: 22 },
        { bottom: "18%", left: "14%", delay: "4.3s", size: 18 },
        { bottom: "28%", right: "18%", delay: "1.2s", size: 30 },
      ].map((star, i) => (
        <div
          key={i}
          className="absolute text-ring/40 motion-safe:animate-[star-float_9s_ease-in-out_infinite]"
          style={{ ...star, animationDelay: star.delay }}
        >
          <Star
            className="size-full"
            strokeWidth={1.25}
            style={{ width: star.size, height: star.size }}
          />
        </div>
      ))}
    </div>
  );
}
