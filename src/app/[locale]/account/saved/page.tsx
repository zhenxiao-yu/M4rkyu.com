import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/lib/auth/require-user";
import { getSavedItems } from "@/lib/social/saves";
import { lookupContent, type ContentSummary } from "@/lib/content/lookup";
import type { SavedItemRow, SavedItemType } from "@/lib/supabase/types";
import type { Locale } from "@/i18n/routing";
import { cn, FOCUS_RING_INSET } from "@/lib/utils";
import { AccountNav } from "../_components/account-nav";

export const dynamic = "force-dynamic";

/**
 * Order saved-items are surfaced in. Frames lead because they're the
 * site's most-saved type by design (gallery has the biggest item
 * surface); writing forms (logs/notes) trail. The fallback for an
 * unknown type stays as "iteration order" which is stable for a
 * `Map`.
 */
const SECTION_ORDER: SavedItemType[] = [
  "gallery",
  "project",
  "game",
  "resource",
  "log",
  "note",
];

export default async function AccountSavedPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  await requireUser(locale);
  const t = await getTranslations({ locale, namespace: "Account" });

  const items = await getSavedItems();

  // Group on the server so the page renders as a static sectioned
  // index — no client-side regrouping needed.
  const grouped = new Map<SavedItemType, SavedItemRow[]>();
  for (const item of items) {
    const bucket = grouped.get(item.item_type) ?? [];
    bucket.push(item);
    grouped.set(item.item_type, bucket);
  }
  const sections = SECTION_ORDER.flatMap((type) => {
    const rows = grouped.get(type);
    if (!rows || rows.length === 0) return [];
    return [{ type, rows }];
  });

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("savedTitle")}
        description={t("savedDescription")}
        decorativeWord="SAVED"
      />
      <PageSection>
        <AccountNav locale={locale} />

        {items.length === 0 ? (
          /* Empty state — wall-label panel with the same vertical
           * ring-tinted hairline rule used in the lightbox sidebar
           * and the auth modal header. Quieter than a plain card. */
          <div className="relative max-w-xl rounded-[1.25rem] border border-border/70 bg-card/70 p-6 pl-7 shadow-[0_18px_60px_rgba(0,0,0,0.10)] backdrop-blur-sm">
            <span
              aria-hidden="true"
              className="absolute left-3 top-6 bottom-6 w-px bg-linear-to-b from-ring/60 via-ring/25 to-transparent"
            />
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              {t("savedTitle")}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("savedEmpty")}
            </p>
          </div>
        ) : (
          <div className="grid gap-12">
            {sections.map(({ type, rows }) => (
              <SavedSection
                key={type}
                rows={rows}
                locale={locale}
                sectionLabel={t(`savedSection.${type}`)}
                tombstoneLabel={t("tombstone")}
              />
            ))}
          </div>
        )}
      </PageSection>
    </PageShell>
  );
}

function SavedSection({
  rows,
  locale,
  sectionLabel,
  tombstoneLabel,
}: {
  rows: SavedItemRow[];
  locale: Locale;
  sectionLabel: string;
  tombstoneLabel: string;
}) {
  return (
    <section>
      {/* Section header — mono eyebrow on the left, pixel-font count
       * on the right, hairline rule below. Echoes the manage-content
       * header in /admin so the field-notebook idiom stays inside
       * the site's existing typographic grammar. */}
      <header className="flex items-baseline justify-between gap-3 border-b border-border/70 pb-3">
        <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
          {sectionLabel}
        </h2>
        <span
          aria-hidden="true"
          className="font-pixel text-sm leading-none text-muted-foreground/70 tabular-nums"
        >
          {String(rows.length).padStart(2, "0")}
        </span>
      </header>

      <ol className="grid gap-1 pt-1">
        {rows.map((row, index) => {
          const summary = lookupContent(row.item_type, row.item_key);
          return (
            <SavedEntry
              key={`${row.item_type}:${row.item_key}`}
              channel={String(index + 1).padStart(2, "0")}
              row={row}
              summary={summary}
              locale={locale}
              tombstoneLabel={tombstoneLabel}
            />
          );
        })}
      </ol>
    </section>
  );
}

function SavedEntry({
  channel,
  row,
  summary,
  locale,
  tombstoneLabel,
}: {
  channel: string;
  row: SavedItemRow;
  summary: ContentSummary | null;
  locale: Locale;
  tombstoneLabel: string;
}) {
  /* Tombstone — the saved key no longer resolves to any content.
   * Visually distinct: line-through title, --signal strike across the
   * row, mono tombstone marker. Stays selectable + readable. */
  if (!summary) {
    return (
      <li className="group relative overflow-hidden rounded-md">
        <div className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-3 py-3">
          <span
            aria-hidden="true"
            className="font-pixel text-xl leading-none text-muted-foreground/40 tabular-nums line-through decoration-signal/70"
          >
            {channel}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-muted-foreground line-through decoration-signal/70">
              {row.item_key}
            </p>
            <p className="mt-1 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-signal/75">
              {tombstoneLabel}
            </p>
          </div>
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground/70">
            {row.item_type}
          </span>
        </div>
      </li>
    );
  }

  const inner = (
    <div className="grid grid-cols-[2.5rem_auto_1fr_auto] items-center gap-3 px-3 py-3">
      {/* Index — pixel-font channel number, brightens on hover. */}
      <span
        aria-hidden="true"
        className="font-pixel text-xl leading-none text-muted-foreground/70 tabular-nums transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:text-foreground"
      >
        {channel}
      </span>

      {/* Proof-print thumb — a tiny 28px square pulled from imageSrc.
       * Reserved as a fixed cell even when absent so titles align
       * across rows with and without covers (a notebook page with a
       * pasted print sitting in the margin keeps its baseline). */}
      <ProofThumb summary={summary} />

      <div className="min-w-0">
        <p className="truncate text-sm font-medium leading-snug text-foreground">
          {summary.title}
        </p>
        {summary.subtitle ? (
          <p className="mt-0.5 truncate font-mono text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground">
            {summary.subtitle}
          </p>
        ) : null}
      </div>

      <span className="inline-flex items-center gap-1 font-mono text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground">
        {summary.external ? (
          <ArrowUpRight aria-hidden="true" className="size-3" />
        ) : null}
        {row.item_type}
      </span>
    </div>
  );

  return (
    <li className="group relative overflow-hidden rounded-md transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:bg-card/55">
      {/* Vertical accent rule on the left — ignites to --ring on
       * hover. Same idiom used on the admin manage-content cards;
       * keeps the field-notebook entries readable as part of the
       * same design system. */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-2 bottom-2 w-[2px] rounded-full bg-border/70 transition-colors duration-(--motion-medium) ease-(--ease-premium) group-hover:bg-ring"
      />
      {summary.external ? (
        <a
          href={summary.href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn("block pl-2", FOCUS_RING_INSET)}
        >
          {inner}
        </a>
      ) : (
        <Link
          href={summary.href}
          locale={locale}
          className={cn("block pl-2", FOCUS_RING_INSET)}
        >
          {inner}
        </Link>
      )}
    </li>
  );
}

function ProofThumb({ summary }: { summary: ContentSummary }) {
  if (!summary.imageSrc) {
    /* No cover — render a thin hairline placeholder so titles
     * stay aligned. */
    return (
      <span
        aria-hidden="true"
        className="block size-7 rounded-sm border border-dashed border-border/60"
      />
    );
  }
  return (
    <span className="block size-7 shrink-0 overflow-hidden rounded-sm border border-border/60 bg-muted shadow-sm">
      <Image
        src={summary.imageSrc}
        alt={summary.imageAlt ?? ""}
        width={56}
        height={56}
        sizes="28px"
        className="size-full object-cover"
      />
    </span>
  );
}
