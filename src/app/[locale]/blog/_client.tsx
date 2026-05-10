"use client";

import { useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostListItem } from "@/components/cards/post-list-item";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import type { Post } from "@/content/schemas";

interface BlogTimelineProps {
  posts: Post[];
}

const ALL_TAG = "__all__";

export function BlogTimeline({ posts }: BlogTimelineProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const t = useTranslations("Blog");

  const allTags = useMemo(
    () => Array.from(new Set(posts.flatMap((p) => p.tags))).sort(),
    [posts],
  );
  const tagParam = searchParams.get("tag");
  const activeTag = tagParam && allTags.includes(tagParam) ? tagParam : ALL_TAG;

  function setTag(tag: string) {
    const params = new URLSearchParams(searchParams);
    if (tag === ALL_TAG) params.delete("tag");
    else params.set("tag", tag);
    startTransition(() => {
      const next = params.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, {
        scroll: false,
      });
    });
  }

  const filtered =
    activeTag === ALL_TAG
      ? posts
      : posts.filter((p) => p.tags.includes(activeTag));

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-auto p-0 hover:bg-transparent"
          aria-pressed={activeTag === ALL_TAG}
          onClick={() => setTag(ALL_TAG)}
        >
          <Badge
            variant={activeTag === ALL_TAG ? "success" : "outline"}
            className="cursor-pointer transition-colors"
          >
            {t("tagAll")}
          </Badge>
        </Button>
        {allTags.map((tag) => (
          <Button
            key={tag}
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto p-0 hover:bg-transparent"
            aria-pressed={activeTag === tag}
            onClick={() => setTag(tag)}
          >
            <Badge
              variant={activeTag === tag ? "success" : "outline"}
              className="cursor-pointer transition-colors"
            >
              {tag}
            </Badge>
          </Button>
        ))}
        <span className="ml-2 font-mono text-xs text-muted-foreground">
          {filtered.length} / {posts.length}
        </span>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-12 text-center font-mono text-sm text-muted-foreground">
          {t("noMatches")}
        </p>
      ) : (
        <Stagger
          // Re-key on tag change so the rows restagger smoothly when
          // a chip flips. Same pattern as the projects archive.
          key={`stagger-${activeTag}`}
          as="ol"
          className="mt-8 grid gap-1 divide-y divide-border/60"
          delay={0.04}
        >
          {filtered.map((post) => (
            <StaggerItem key={post.slug} as="li">
              <PostListItem post={post} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </>
  );
}
