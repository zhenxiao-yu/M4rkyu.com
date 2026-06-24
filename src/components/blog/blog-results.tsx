"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { FileSearch, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/cards/post-card";
import { PostListItem } from "@/components/cards/post-list-item";
import type { Post } from "@/content/schemas";
import type { BlogViewMode } from "./use-view-mode";

interface BlogResultsProps {
  posts: Post[];
  viewMode: BlogViewMode;
  onClearFilters: () => void;
}

export function BlogResults({
  posts,
  viewMode,
  onClearFilters,
}: BlogResultsProps) {
  const reduceMotion = useReducedMotion();
  const t = useTranslations("Blog");

  if (posts.length === 0) {
    return <BlogEmptyState onClear={onClearFilters} />;
  }

  return (
    <>
      {viewMode === "grid" ? (
        <motion.ol
          layout={!reduceMotion}
          className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3 3xl:grid-cols-4"
        >
          <AnimatePresence initial={false}>
            {posts.map((post, i) => (
              <ResultMotionItem
                key={post.slug}
                index={i}
                axis="y"
                reduceMotion={reduceMotion}
              >
                <PostCard post={post} />
              </ResultMotionItem>
            ))}
          </AnimatePresence>
        </motion.ol>
      ) : (
        <motion.ol
          layout={!reduceMotion}
          className="divide-y divide-border/70 border-y border-border/70"
        >
          <AnimatePresence initial={false}>
            {posts.map((post, i) => (
              <ResultMotionItem
                key={post.slug}
                index={i}
                axis="x"
                reduceMotion={reduceMotion}
              >
                <PostListItem post={post} />
              </ResultMotionItem>
            ))}
          </AnimatePresence>
        </motion.ol>
      )}
      <p className="text-center font-mono text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">
        {t("endOfResults", { count: posts.length })}
      </p>
    </>
  );
}

function ResultMotionItem({
  children,
  index,
  axis,
  reduceMotion,
}: {
  children: ReactNode;
  index: number;
  axis: "x" | "y";
  reduceMotion: boolean | null;
}) {
  const initialOffset = axis === "x" ? { x: -8 } : { y: 10 };
  const exitOffset = axis === "x" ? { x: 8 } : { y: -8 };

  return (
    <motion.li
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, ...initialOffset }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, ...exitOffset }}
      transition={{
        duration: axis === "x" ? 0.2 : 0.22,
        delay: reduceMotion
          ? 0
          : Math.min(index * (axis === "x" ? 0.01 : 0.015), 0.12),
        ease: [0.2, 0.7, 0.2, 1],
      }}
      className={axis === "y" ? "h-full" : undefined}
    >
      {children}
    </motion.li>
  );
}

function BlogEmptyState({ onClear }: { onClear: () => void }) {
  const t = useTranslations("Blog");
  return (
    <div className="border-y border-dashed border-border px-5 py-14 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-full border border-border bg-background text-muted-foreground">
        <FileSearch aria-hidden="true" className="size-5" />
      </div>
      <h3 className="mt-5 font-heading text-xl font-semibold tracking-normal text-foreground">
        {t("noMatches")}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {t("noMatchesHint")}
      </p>
      <Button
        type="button"
        variant="outline"
        className="mt-6"
        onClick={onClear}
      >
        <RotateCcw aria-hidden="true" className="size-4" />
        {t("clearFilters")}
      </Button>
    </div>
  );
}
