import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PlaceholderImage } from "@/components/placeholders/placeholder-image";
import { FadeIn } from "@/components/motion/fade-in";
import { profile } from "@/content/profile";
import { HomeSection } from "./home-section";
import type { Locale } from "@/i18n/routing";

interface AboutBrieflyProps {
  locale: Locale;
}

/**
 * Short "Mark, briefly" intro on the home page. Uses the shared
 * HomeSection shell for the eyebrow/heading/lede/action header.
 *
 * Inside the shell: 2-column body — left has the values list +
 * "read longer" link, right has the portrait placeholder. Mobile
 * stacks naturally with the portrait first (face appears before
 * copy when scrolling).
 */
export async function AboutBriefly({ locale }: AboutBrieflyProps) {
  const t = await getTranslations({ locale, namespace: "Home.aboutBriefly" });
  const values = profile.values.slice(0, 2);

  return (
    <HomeSection
      tone="default"
      eyebrow={t("eyebrow")}
      heading={t("heading")}
      lede={profile.intro}
      action={
        <Link
          href="/about"
          locale={locale}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {t("readLonger")}
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      }
      dataSection="about-briefly"
    >
      <div className="grid items-start gap-10 md:grid-cols-[1fr_0.85fr] lg:gap-16">
        <FadeIn>
          <ul className="grid gap-2.5 max-w-xl">
            {values.map((value, i) => (
              <li
                key={value}
                className="grid grid-cols-[2.25rem_1fr] items-start gap-3 rounded-md border bg-card/40 p-3 transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/40"
              >
                <span className="font-mono text-[0.65rem] tracking-[0.22em] text-muted-foreground/70 pt-0.5">
                  0{i + 1}
                </span>
                <span className="text-sm leading-6">{value}</span>
              </li>
            ))}
          </ul>
          <p className="mt-6 max-w-md text-sm leading-6 text-muted-foreground">
            {t("subnote")}
          </p>
        </FadeIn>
        <FadeIn direction="left" delay={0.1}>
          <PlaceholderImage
            label={t("portraitLabel")}
            aspect="aspect-4/5"
            className="mx-auto max-w-sm md:max-w-none"
          />
        </FadeIn>
      </div>
    </HomeSection>
  );
}
