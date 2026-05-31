import { ArrowUpRight, Star } from "lucide-react";
import { PostBody } from "@/components/blog/post-body";
import { StatusPulse } from "@/components/ui/pixel/status-pulse";
import { cn, FOCUS_RING } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";
import type { Note } from "@/content/schemas";

export interface NotesTimelineLabels {
  kind: Record<Note["kind"], string>;
  permalink: string;
  rating: (value: number) => string;
  linkCta: string;
  latest: string;
}

const DATE_LOCALE: Record<Locale, string> = {
  en: "en-US",
  zh: "zh-CN",
};

// Parse a "YYYY-MM-DD…" string into its parts without going through a
// Date (which would shift the day across timezones at UTC midnight).
function parts(iso: string): { y: string; m: string; d: string } {
  const [y = "", m = "", d = ""] = iso.slice(0, 10).split("-");
  return { y, m, d };
}

function monthLabel(iso: string, locale: Locale): string {
  const { y, m } = parts(iso);
  const date = new Date(Date.UTC(Number(y), Number(m) - 1, 1));
  return new Intl.DateTimeFormat(DATE_LOCALE[locale] ?? "en-US", {
    year: "numeric",
    month: "long",
    timeZone: "UTC",
  }).format(date);
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function Stars({ value, label }: { value: number; label: string }) {
  return (
    <div
      className="flex items-center gap-0.5 text-ring"
      role="img"
      aria-label={label}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={cn(
            "size-3.5",
            i < value ? "fill-current" : "text-muted-foreground/40",
          )}
        />
      ))}
    </div>
  );
}

function TierRows({ tiers }: { tiers: Note["tiers"] }) {
  return (
    <div className="mt-3 grid gap-1.5">
      {tiers.map((tier) => (
        <div
          key={tier.label}
          className="flex items-start gap-3 rounded-sm border border-border/60 bg-muted/20 p-2"
        >
          <span className="min-w-8 rounded-xs bg-ring/15 px-1.5 py-0.5 text-center font-pixel text-sm uppercase text-foreground">
            {tier.label}
          </span>
          <span className="pt-0.5 text-sm leading-6 text-foreground/90">
            {tier.items.join(" · ")}
          </span>
        </div>
      ))}
    </div>
  );
}

function NoteRow({
  note,
  labels,
  isLatest,
  entryNumber,
}: {
  note: Note;
  labels: NotesTimelineLabels;
  isLatest: boolean;
  /** Descending dispatch number — latest entry has the highest. */
  entryNumber: number;
}) {
  const { y, m, d } = parts(note.publishedAt);
  const showLink =
    note.link && (note.kind === "repost" || note.kind === "review");
  const entryLabel = `№ ${String(entryNumber).padStart(3, "0")}`;

  return (
    <li
      id={note.slug}
      className="grid scroll-mt-24 grid-cols-[3.5rem_1.25rem_1fr] gap-x-3 sm:grid-cols-[4.25rem_1.5rem_1fr] sm:gap-x-4"
    >
      {/* Date stamp — the day reads as a pixel-font typographic anchor
       * (the "engraved log entry" gesture), with a tiny mono YYYY·MM
       * underneath for absolute context inside a long timeline. Also
       * the permalink anchor — clickable, focusable. */}
      <a
        href={`#${note.slug}`}
        aria-label={labels.permalink}
        title={labels.permalink}
        className={cn(
          "group/date flex flex-col items-end gap-1 pt-0.5 text-right",
          FOCUS_RING,
        )}
      >
        <span
          aria-hidden="true"
          className="font-pixel text-2xl leading-none tabular-nums text-foreground/85 transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover/date:text-foreground sm:text-3xl"
        >
          {d}
        </span>
        <span
          aria-hidden="true"
          className="font-mono text-[0.55rem] uppercase leading-none tracking-[0.18em] text-muted-foreground/70 tabular-nums"
        >
          {y}·{m}
        </span>
      </a>

      {/* Rail — continuous hairline with a node aligned to the
       * entry-number eyebrow. Latest entry earns the live "now" pulse;
       * older entries get a neutral dot. */}
      <div className="relative flex justify-center">
        <span
          aria-hidden="true"
          className="absolute inset-y-0 w-px bg-border/70"
        />
        <span className="relative mt-1.5">
          {isLatest ? (
            <StatusPulse tone="now" size="md" />
          ) : (
            <span
              aria-hidden="true"
              className="block size-2 rounded-full bg-muted-foreground/40 ring-2 ring-background"
            />
          )}
        </span>
      </div>

      {/* Content column. */}
      <div className="min-w-0 pb-10">
        {/* Eyebrow row — entry numero, kind, "latest" flag. The numero
         * sign is language-neutral typographic shorthand for "number"
         * and pairs with the existing pixel-font idioms elsewhere on
         * the site (PLATE in lightbox, channel in admin). */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            aria-hidden="true"
            className="font-pixel text-sm leading-none text-muted-foreground/65 tabular-nums"
          >
            {entryLabel}
          </span>
          <span className="font-mono text-[0.6rem] uppercase leading-none tracking-[0.22em] text-ring">
            {labels.kind[note.kind]}
          </span>
          {isLatest ? (
            <span className="font-mono text-[0.6rem] uppercase leading-none tracking-[0.22em] text-muted-foreground/70">
              {labels.latest}
            </span>
          ) : null}
        </div>

        {note.title ? (
          <h3 className="mt-2 font-heading text-lg font-semibold leading-snug tracking-tight text-foreground">
            {note.title}
          </h3>
        ) : null}

        {note.kind === "review" && note.rating ? (
          <div className="mt-1.5">
            <Stars value={note.rating} label={labels.rating(note.rating)} />
          </div>
        ) : null}

        {note.body ? (
          <PostBody
            markdown={note.body}
            className="mt-2 max-w-none text-foreground/90 [&>*:first-child]:mt-0! [&_blockquote]:mt-3! [&_ol]:mt-2.5! [&_p]:mt-2.5! [&_ul]:mt-2.5!"
          />
        ) : null}

        {note.kind === "tierlist" && note.tiers.length > 0 ? (
          <TierRows tiers={note.tiers} />
        ) : null}

        {/* Outbound link — reshaped as a wall-label with a vertical
         * ring-tinted hairline rule on the left. Same idiom used in
         * the lightbox sidebar / auth modal header / saved-items
         * empty-state, so the timeline reads as part of the same
         * visual grammar instead of a one-off chip. */}
        {showLink && note.link ? (
          <a
            href={note.link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group/cite relative mt-4 inline-flex max-w-full items-center gap-2 rounded-[0.85rem] border border-border/70 bg-card/55 py-2 pl-4 pr-3 text-sm text-foreground/90 transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/55 hover:text-foreground",
              FOCUS_RING,
            )}
          >
            <span
              aria-hidden="true"
              className="absolute left-1.5 top-2 bottom-2 w-px bg-linear-to-b from-ring/60 via-ring/25 to-transparent"
            />
            <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground">
              {hostnameOf(note.link.url)}
            </span>
            {note.link.label ? (
              <span className="truncate">{note.link.label}</span>
            ) : null}
            <ArrowUpRight
              aria-hidden="true"
              className="size-3.5 shrink-0 opacity-70 transition-transform duration-(--motion-fast) ease-(--ease-premium) group-hover/cite:translate-x-0.5 group-hover/cite:translate-y-[-1px] group-hover/cite:opacity-100"
            />
            <span className="sr-only">{labels.linkCta}</span>
          </a>
        ) : null}

        {note.tags.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="font-mono text-[0.65rem] lowercase text-muted-foreground/70"
              >
                #{tag}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </li>
  );
}

export function NotesTimeline({
  notes,
  locale,
  labels,
}: {
  notes: Note[];
  locale: Locale;
  labels: NotesTimelineLabels;
}) {
  // Newest first; the very first row earns the live "now" node.
  const sorted = [...notes].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
  const latestSlug = sorted[0]?.slug;

  // Group consecutive entries by calendar month for editorial headers.
  const groups: { key: string; label: string; items: Note[] }[] = [];
  for (const note of sorted) {
    const { y, m } = parts(note.publishedAt);
    const key = `${y}-${m}`;
    const last = groups[groups.length - 1];
    if (last && last.key === key) {
      last.items.push(note);
    } else {
      groups.push({
        key,
        label: monthLabel(note.publishedAt, locale),
        items: [note],
      });
    }
  }

  // Descending dispatch number — the latest entry holds the largest
  // number (sorted[0]). Stable across re-renders because the slug+date
  // sort is deterministic.
  const total = sorted.length;
  const numberBySlug = new Map<string, number>();
  sorted.forEach((note, index) => {
    numberBySlug.set(note.slug, total - index);
  });

  return (
    <div className="mx-auto max-w-2xl">
      {groups.map((group) => (
        <section key={group.key} className="mb-2">
          {/* Editorial month header — mono label on the left, pixel-font
           * entry count on the right ("MAY 2026  ·  04"), hairline rule
           * connecting them. Same beat as the admin "manage content"
           * header so the typographic grammar stays consistent across
           * surfaces. */}
          <div className="mb-5 flex items-baseline gap-3">
            <h2 className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
              {group.label}
            </h2>
            <span aria-hidden="true" className="h-px flex-1 bg-border/50" />
            <span
              aria-hidden="true"
              className="font-pixel text-sm leading-none text-muted-foreground/65 tabular-nums"
            >
              {String(group.items.length).padStart(2, "0")}
            </span>
          </div>
          <ol>
            {group.items.map((note) => (
              <NoteRow
                key={note.slug}
                note={note}
                labels={labels}
                isLatest={note.slug === latestSlug}
                entryNumber={numberBySlug.get(note.slug) ?? 0}
              />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
