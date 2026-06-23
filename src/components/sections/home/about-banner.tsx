import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { profile } from "@/content/profile";
import { SectionActionLink } from "./section-action-link";
import { SectionEyebrow } from "./section-eyebrow";
import type { Locale } from "@/i18n/routing";

/**
 * Slim About banner — the Connect act's first beat. Replaces the heavier
 * portrait + copy block with a single horizontal strip: a small portrait (or
 * monogram) + eyebrow + one line + "the full story" link into /about. Keeps the
 * home calm and lets the real About page carry the depth. Reuses the existing
 * Home.aboutPreview.* copy — no new keys.
 */
export async function AboutBanner({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "Home.aboutPreview" });
  const portrait = profile.portrait;

  return (
    <div className="flex flex-col gap-5 rounded-2xl glass-surface px-5 py-5 sm:flex-row sm:items-center sm:gap-6 sm:px-7 sm:py-6">
      {portrait ? (
        <div className="relative size-14 shrink-0 overflow-hidden rounded-full border border-border/60 sm:size-16">
          <Image
            src={portrait.src}
            alt={portrait.alt}
            fill
            sizes="4rem"
            className="object-cover [@media(pointer:fine)]:grayscale"
          />
        </div>
      ) : (
        <div
          aria-hidden="true"
          className="grid size-14 shrink-0 place-items-center rounded-full border border-border/60 bg-card/40 font-wordmark text-xl text-foreground/80 shadow-[0_0_24px_-12px_color-mix(in_srgb,var(--ring)_60%,transparent)] sm:size-16"
        >
          M
        </div>
      )}

      <div className="min-w-0 flex-1">
        <SectionEyebrow>{t("eyebrow")}</SectionEyebrow>
        <p className="mt-1.5 text-base font-medium leading-snug text-foreground sm:text-lg">
          {t("heading")}{" "}
          <span className="font-normal text-muted-foreground">
            — {profile.name} · {profile.location}
          </span>
        </p>
      </div>

      <SectionActionLink href="/about" locale={locale} className="shrink-0">
        {t("open")}
      </SectionActionLink>
    </div>
  );
}
