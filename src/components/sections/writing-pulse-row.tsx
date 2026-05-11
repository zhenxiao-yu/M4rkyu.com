import { ArrowUpRight } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DraftBadge } from "@/components/placeholders/draft-badge";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { Post } from "@/content/schemas";

type Slot = "latest" | "devlog";

interface WritingPulseRowProps {
  posts: { latest?: Post; devlog?: Post };
}

const eyebrowKeyBySlot: Record<Slot, "writing" | "devlog"> = {
  latest: "writing",
  devlog: "devlog",
};

const emptyKeyBySlot: Record<Slot, "writingSoon" | "devlogSoon"> = {
  latest: "writingSoon",
  devlog: "devlogSoon",
};

const monoEyebrow =
  "font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground";

export async function WritingPulseRow({ posts }: WritingPulseRowProps) {
  const t = await getTranslations("Pulse");
  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      <PulseSlot slot="latest" post={posts.latest} t={t} />
      <PulseSlot slot="devlog" post={posts.devlog} t={t} />
    </div>
  );
}

type Translator = Awaited<ReturnType<typeof getTranslations<"Pulse">>>;

function PulseSlot({
  slot,
  post,
  t,
}: {
  slot: Slot;
  post?: Post;
  t: Translator;
}) {
  if (!post) return <EmptyPulseCell slot={slot} t={t} />;

  const eyebrow = t(eyebrowKeyBySlot[slot]);

  return (
    <Card className="group flex h-full flex-col bg-card/80 transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 hover:shadow-lg hover:shadow-ring/5">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={monoEyebrow}>{eyebrow}</span>
            {post.status !== "ready" ? <DraftBadge label={post.status} /> : null}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-0.5 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            <span>{post.date}</span>
            <span>{post.readingTime}</span>
          </div>
        </div>
        <CardTitle className="text-base font-semibold leading-snug">
          {post.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-auto flex flex-1 flex-col gap-4">
        <p className="text-sm leading-6 text-muted-foreground line-clamp-3">
          {post.excerpt}
        </p>
        {post.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="text-[0.6rem] lowercase tracking-[0.1em]"
              >
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
        <div className="mt-auto pt-1">
          <Link
            href={`/logs/${post.slug}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline"
          >
            {t("read")}
            <ArrowUpRight
              aria-hidden="true"
              className="size-3.5 transition-transform duration-(--motion-fast) group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyPulseCell({ slot, t }: { slot: Slot; t: Translator }) {
  return (
    <div
      className={cn(
        "flex h-full min-h-[180px] flex-col items-start justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 p-6",
      )}
    >
      <span className={monoEyebrow}>{t(emptyKeyBySlot[slot])}</span>
      <p className="text-sm leading-6 text-muted-foreground">{t("queued")}</p>
    </div>
  );
}
