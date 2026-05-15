// Visual approximation; the production component is async and reads getTranslations.
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DraftBadge } from "@/components/placeholders/draft-badge";
import { Link } from "@/i18n/navigation";
import type { Post } from "@/content/schemas";

function PinnedPostCardClone({ post }: { post: Post }) {
  const isDraft = post.status !== "ready";
  return (
    <Link
      href={`/logs/${post.slug}`}
      className="group relative grid gap-4 overflow-hidden rounded-lg border border-border bg-card p-6 text-card-foreground shadow-sm transition-colors duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-8"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.24em] text-signal">
          ★ Pinned
        </span>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
          {post.category}
        </span>
        {isDraft ? <DraftBadge label={post.status} /> : null}
      </div>
      <h3 className="font-heading text-2xl font-semibold leading-tight text-balance sm:text-3xl">
        {post.title}
        <ArrowUpRight
          aria-hidden="true"
          className="ml-2 inline size-5 -translate-y-1 text-muted-foreground transition-transform duration-(--motion-fast) group-hover:-translate-y-2 group-hover:translate-x-0.5 group-hover:text-foreground"
        />
      </h3>
      <p className="max-w-2xl text-base leading-7 text-muted-foreground">
        {post.excerpt}
      </p>
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
          {post.date} · {post.readingTime}
        </span>
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
      </div>
    </Link>
  );
}

const samplePost: Post = {
  title: "Field notes from the redesign archive",
  slug: "field-notes-redesign-archive",
  category: "Field notes",
  excerpt:
    "How the portfolio rebuild leans on a Zod content layer, owned UI primitives, and an editorial pace that resists feature creep.",
  date: "2025-09-01",
  readingTime: "7 min",
  tags: ["nextjs", "process", "writing"],
  status: "ready",
  pinned: true,
  reactionsCount: 0,
  commentsCount: 0,
};

const longTitlePost: Post = {
  ...samplePost,
  slug: "long-title-pinned-post",
  title:
    "A deliberately long pinned headline that wraps across multiple lines on desktop to verify the display family rhythm",
};

const meta = {
  title: "cards/PinnedPostCard",
  component: PinnedPostCardClone,
} satisfies Meta<typeof PinnedPostCardClone>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { post: samplePost } };
export const LongTitle: Story = { args: { post: longTitlePost } };
export const Draft: Story = { args: { post: { ...samplePost, status: "draft" } } };
