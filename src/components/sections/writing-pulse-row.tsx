import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { BentoFx, BentoGrid } from "@/components/about/bento-fx";
import { SystemBadge } from "@/components/ui/pixel/system-badge";
import { DraftBadge } from "@/components/placeholders/draft-badge";
import { Link } from "@/i18n/navigation";
import { cn, FOCUS_RING } from "@/lib/utils";
import type { Post } from "@/content/schemas";

interface WritingPulseRowProps {
  posts: { latest?: Post; devlog?: Post };
}

const meta =
  "font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground";

export async function WritingPulseRow({ posts }: WritingPulseRowProps) {
  const t = await getTranslations("Pulse");

  return (
    // Feature + secondary: the latest post is the wide cell with a live
    // pulse; the devlog rides shotgun as a narrower companion.
    <BentoGrid className="grid grid-cols-1 gap-5 md:grid-cols-[1.4fr_1fr]">
      <FeatureSlot post={posts.latest} t={t} />
      <SecondarySlot post={posts.devlog} t={t} />
    </BentoGrid>
  );
}

type Translator = Awaited<ReturnType<typeof getTranslations<"Pulse">>>;

function FeatureSlot({ post, t }: { post?: Post; t: Translator }) {
  if (!post) {
    return <EmptyCell pattern="scanline" label={t("writingSoon")} body={t("queued")} />;
  }
  return (
    <BentoFx pattern="scanline" className="h-full">
      <Link
        href={`/logs/${post.slug}`}
        aria-label={post.title}
        className={cn(
          "group flex h-full flex-col gap-4 rounded-lg border bg-card/70 p-6 transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50",
          FOCUS_RING,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <SystemBadge kind="now" label={t("shipping")} />
            {post.status !== "ready" ? <DraftBadge label={post.status} /> : null}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            <span className={meta}>{post.date}</span>
            <span className={meta}>{post.readingTime}</span>
          </div>
        </div>
        <h3 className="font-heading text-xl font-semibold leading-snug sm:text-2xl">
          {post.title}
        </h3>
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
          {post.excerpt}
        </p>
        {post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[0.6rem] lowercase tracking-widest"
              >
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-medium text-foreground">
          {t("read")}
          <ArrowUpRight
            aria-hidden="true"
            className="size-3.5 transition-transform duration-(--motion-fast) group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
      </Link>
    </BentoFx>
  );
}

function SecondarySlot({ post, t }: { post?: Post; t: Translator }) {
  if (!post) {
    return <EmptyCell pattern="dots" label={t("devlogSoon")} body={t("queued")} />;
  }
  return (
    <BentoFx pattern="dots" className="h-full">
      <Link
        href={`/logs/${post.slug}`}
        aria-label={post.title}
        className={cn(
          "group flex h-full flex-col gap-3 rounded-lg border bg-card/70 p-5 transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50",
          FOCUS_RING,
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <SystemBadge kind="info" label={t("devlog")} />
          <span className={meta}>{post.date}</span>
        </div>
        <h3 className="text-base font-semibold leading-snug">{post.title}</h3>
        <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
          {post.excerpt}
        </p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-1 text-sm font-medium text-foreground">
          {t("read")}
          <ArrowUpRight
            aria-hidden="true"
            className="size-3.5 transition-transform duration-(--motion-fast) group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </span>
      </Link>
    </BentoFx>
  );
}

function EmptyCell({
  pattern,
  label,
  body,
}: {
  pattern: "scanline" | "dots";
  label: string;
  body: string;
}) {
  return (
    <BentoFx pattern={pattern} spotlight={false} className="h-full">
      <div className="flex h-full min-h-45 flex-col items-start justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 p-6">
        <span className={meta}>{label}</span>
        <p className="text-sm leading-6 text-muted-foreground">{body}</p>
      </div>
    </BentoFx>
  );
}
