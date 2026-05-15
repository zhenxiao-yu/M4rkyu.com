import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { WritingPulseRow } from "@/components/sections/writing-pulse-row";
import { Link } from "@/i18n/navigation";
import { getPosts } from "@/lib/blog/get-posts";
import { HomeSection } from "./home-section";
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
      tone="muted"
      eyebrow={t("writingEyebrow")}
      heading={t("latest")}
      lede={t("latestDescription")}
      action={
        <Link
          href="/logs"
          locale={locale}
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.22em] text-foreground transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:text-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {t("allLogs")}
          <ArrowUpRight aria-hidden="true" className="size-3.5" />
        </Link>
      }
      dataSection="writing-pulse"
    >
      <WritingPulseRow posts={{ latest: writingLatest, devlog: writingDevlog }} />
    </HomeSection>
  );
}
