import { ArrowUpRight, Hash, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PostBody } from "@/components/blog/post-body";
import { cn, FOCUS_RING } from "@/lib/utils";
import type { Locale } from "@/i18n/routing";
import type { Note } from "@/content/schemas";

export interface NoteCardLabels {
  kind: Record<Note["kind"], string>;
  permalink: string;
  rating: (value: number) => string;
  linkCta: string;
}

const DATE_LOCALE: Record<Locale, string> = {
  en: "en-US",
  zh: "zh-CN",
};

function formatDate(iso: string, locale: Locale): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat(DATE_LOCALE[locale] ?? "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
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
            "size-4",
            i < value ? "fill-current" : "text-muted-foreground/40",
          )}
        />
      ))}
    </div>
  );
}

function TierRows({ tiers }: { tiers: Note["tiers"] }) {
  return (
    <div className="mt-4 grid gap-1.5">
      {tiers.map((tier) => (
        <div
          key={tier.label}
          className="flex items-start gap-3 rounded-md border border-border/60 bg-muted/30 p-2.5"
        >
          <span className="min-w-9 rounded bg-ring/15 px-2 py-1 text-center font-mono text-xs font-bold uppercase tracking-wide text-foreground">
            {tier.label}
          </span>
          <span className="pt-1 text-sm leading-6 text-foreground/90">
            {tier.items.join(" · ")}
          </span>
        </div>
      ))}
    </div>
  );
}

export function NoteCard({
  note,
  locale,
  labels,
}: {
  note: Note;
  locale: Locale;
  labels: NoteCardLabels;
}) {
  const showLink = note.link && (note.kind === "repost" || note.kind === "review");

  return (
    <article
      id={note.slug}
      className="scroll-mt-24 rounded-lg border border-border/70 bg-card/70 p-5 transition-colors hover:border-ring/40 sm:p-6"
    >
      <div className="flex items-center gap-3">
        <Badge variant="outline" className="font-mono text-[0.6rem] uppercase">
          {labels.kind[note.kind]}
        </Badge>
        <time
          dateTime={note.publishedAt.slice(0, 10)}
          className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground"
        >
          {formatDate(note.publishedAt, locale)}
        </time>
        <a
          href={`#${note.slug}`}
          aria-label={labels.permalink}
          title={labels.permalink}
          className={cn(
            "ml-auto inline-flex size-7 items-center justify-center rounded-md text-muted-foreground/60 transition-colors hover:text-foreground",
            FOCUS_RING,
          )}
        >
          <Hash aria-hidden="true" className="size-3.5" />
        </a>
      </div>

      {note.title ? (
        <h2 className="mt-3 font-heading text-xl font-semibold tracking-tight text-foreground">
          {note.title}
        </h2>
      ) : null}

      {note.kind === "review" && note.rating ? (
        <div className="mt-2">
          <Stars value={note.rating} label={labels.rating(note.rating)} />
        </div>
      ) : null}

      {note.body ? (
        <PostBody markdown={note.body} className="mt-1 max-w-none" />
      ) : null}

      {note.kind === "tierlist" && note.tiers.length > 0 ? (
        <TierRows tiers={note.tiers} />
      ) : null}

      {showLink && note.link ? (
        <a
          href={note.link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mt-4 inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors hover:border-ring/50",
            FOCUS_RING,
          )}
        >
          <span className="truncate">
            {note.link.label || hostnameOf(note.link.url)}
          </span>
          <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
          <span className="sr-only">{labels.linkCta}</span>
        </a>
      ) : null}

      {note.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {note.tags.map((tag) => (
            <Badge
              key={tag}
              variant="default"
              className="font-mono text-[0.6rem] lowercase"
            >
              #{tag}
            </Badge>
          ))}
        </div>
      ) : null}
    </article>
  );
}
