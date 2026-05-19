import { NextResponse } from "next/server";
import { getPosts } from "@/lib/blog/get-posts";

// Cached for 10 min — public, no inputs; prevents trivial loops from hammering dev.to upstream quota.
export const revalidate = 600;

export async function GET() {
  const posts = await getPosts();

  return NextResponse.json(
    {
      posts: posts.slice(0, 20).map((post) => ({
        slug: post.slug,
        title: post.title,
        category: post.category,
        tags: post.tags,
      })),
    },
    {
      headers: {
        "cache-control": "public, s-maxage=600, stale-while-revalidate=86400",
      },
    },
  );
}
