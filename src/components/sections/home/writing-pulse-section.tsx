import { getTranslations } from "next-intl/server";
import { WritingPulseRow } from "@/components/sections/writing-pulse-row";
import { getPosts } from "@/lib/blog/get-posts";
import { HomeSection } from "./home-section";
import { SectionActionLink } from "./section-action-link";
import { SectionBackground } from "./section-background";
import type { Locale } from "@/i18n/routing";

interface WritingPulseSectionProps {
  locale: Locale;
}

/**
 * Home-page wrapper for `<WritingPulseRow>`. Previously the section
 * frame was inlined in `page.tsx` with a different padding rhythm and
 * a `SectionHeading` component (not the inline pattern other sections
 * use). Centralised here so writing pulse matches the rest of the home
 * spine — same eyebrow style, same heading, same lede, same right-rail
 * action link.
 *
 * Data fetch lives here (instead of page.tsx) so the section is fully
 * self-contained: drop `<WritingPulseSection locale={locale} />` into
 * any page and it just works.
 */
export async function WritingPulseSection({ locale }: WritingPulseSectionProps) {
  const t = await getTranslations({ locale, namespace: "Home" });
  const posts = await getPosts();
  const writingLatest = posts[0];
  const writingDevlog = posts.find((p) => p.tags.includes("devlog"));

  // No posts yet → render nothing rather than an empty heading. The
  // /logs route already shows its own empty state.
  if (!writingLatest && !writingDevlog) return null;

  return (
    <HomeSection
      tone="default"
      background={<SectionBackground variant="manuscript" />}
      eyebrow={t("writingEyebrow")}
      heading={t("latest")}
      lede={t("latestDescription")}
      action={
        <SectionActionLink href="/logs" locale={locale}>
          {t("allLogs")}
        </SectionActionLink>
      }
      dataSection="writing-pulse"
    >
      <WritingPulseRow posts={{ latest: writingLatest, devlog: writingDevlog }} />
    </HomeSection>
  );
}
