import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PostListItem } from "./post-list-item";
import { posts } from "@/content/posts";
import type { Post } from "@/content/schemas";

const readyPost: Post = {
  title: "Designing the redesign archive",
  slug: "designing-the-redesign-archive",
  category: "Process",
  excerpt:
    "Notes on porting the portfolio to Next.js, leaning on a Zod content layer, and keeping the editorial pace.",
  date: "2025-08-12",
  readingTime: "6 min",
  tags: ["nextjs", "zod", "content"],
  status: "ready",
  pinned: false,
};

const longExcerptPost: Post = {
  ...readyPost,
  slug: "long-excerpt-post",
  title: "Stress-testing the timeline row at desktop and mobile widths",
  excerpt:
    "An extended excerpt used to stress-test wrapping behaviour across the responsive timeline row. It should remain readable on mobile, fold cleanly under the title on small screens, and keep its mono date column aligned on the desktop layout without nudging the reading-time meta out of place.",
};

function PostListItemStory({ post }: { post: Post }) {
  return (
    <ol className="grid gap-1 divide-y divide-border/60 max-w-3xl">
      <PostListItem post={post} />
    </ol>
  );
}

const meta = {
  title: "cards/PostListItem",
  component: PostListItemStory,
} satisfies Meta<typeof PostListItemStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { post: posts[0] } };

export const LongExcerpt: Story = { args: { post: longExcerptPost } };

export const Ready: Story = { args: { post: readyPost } };
