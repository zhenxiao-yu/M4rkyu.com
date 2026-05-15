import { getTranslations } from "next-intl/server";
import { SectionFrame } from "@/components/ui/pixel/section-frame";
import { NumberedCapability } from "@/components/ui/pixel/numbered-capability";
import { GhostedWord } from "@/components/ui/magic/ghosted-word";
import type { Locale } from "@/i18n/routing";

// Capability rows — structural metadata. Titles + descriptions come from
// the translation file; tags stay canonical English because the values
// are technology / discipline labels that read the same across locales.
const CAPABILITY_ROWS = [
  {
    id: "production",
    index: "01",
    tags: ["Next.js", "TypeScript", "CI", "Observability"],
  },
  {
    id: "interface",
    index: "02",
    tags: ["Tailwind", "Tokens", "Motion", "a11y"],
  },
  {
    id: "game",
    index: "03",
    tags: ["Unity", "Input", "Tuning", "Prototype"],
  },
  {
    id: "ai",
    index: "04",
    tags: ["Agents", "Pipelines", "MDX", "Tooling"],
  },
  {
    id: "visual",
    index: "05",
    tags: ["Photo", "Film", "Direction", "Curation"],
  },
] as const;

export async function CapabilitiesSection({ locale }: { locale: Locale }) {
  const t = await getTranslations({
    locale,
    namespace: "Home.capabilities",
  });

  const titleRaw = t("title");
  // Split on the last word so the ghost-letter motion lands on a single
  // visually-anchored token instead of the entire heading. Works for
  // EN ("Systems & surfaces") and ZH ("系统与界面") — both split cleanly
  // by their final whitespace-or-character group.
  const lastSpace = titleRaw.lastIndexOf(" ");
  const titleHead = lastSpace > 0 ? titleRaw.slice(0, lastSpace + 1) : "";
  const titleTail = lastSpace > 0 ? titleRaw.slice(lastSpace + 1) : titleRaw;

  return (
    <section
      data-snap="section"
      className="relative isolate flex min-h-dvh flex-col justify-center border-b"
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8 lg:py-32">
        {/* No `index` prop — the doc's "05 / capabilities" mono prefix
          * already lives inside the eyebrow string, so passing both would
          * paint "05" twice on the same line. */}
        <SectionFrame
          eyebrow={t("eyebrow")}
          title={
            <>
              {titleHead}
              <GhostedWord text={titleTail} ghosts={5} spread={22} />
            </>
          }
          lede={t("lede")}
        />
        {/* `divide-y divide-dashed` paints the dotted rule between rows
          * (NumberedCapability §4.3 visual spec) without each row needing
          * its own divider logic. */}
        <div className="mt-10 divide-y divide-dashed divide-border/60">
          {CAPABILITY_ROWS.map((row) => (
            <NumberedCapability
              key={row.id}
              index={row.index}
              title={t(`${row.id}.title`)}
              description={t(`${row.id}.description`)}
              tags={row.tags}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
