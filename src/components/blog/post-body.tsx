import Image from "next/image";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";
import { cn } from "@/lib/utils";

interface PostBodyProps {
  markdown: string;
  className?: string;
}

/**
 * Renders dev.to-syndicated post bodies with the site's editorial
 * prose vocabulary instead of dev.to's defaults.
 *
 * - All elements are owned via the `components` map so headings,
 *   blockquotes, code, lists, and tables match the rest of the
 *   case-study surfaces (border-y rules, mono code, ring accents).
 * - Images route through `next/image` with explicit
 *   width/height + lazy loading. dev.to hosts on its CDN so the
 *   `unoptimized` flag stays off — Next.js will optimize them.
 * - Code fences pass through with the language hint left on the
 *   `<pre>`/`<code>` for a future syntax-highlighting pass; the
 *   `font-mono` styles read well unhighlighted.
 */
const components: Components = {
  h1: ({ className, ...props }) => (
    <h1
      {...props}
      className={cn(
        // scroll-mt aligns anchored headings under the sticky site
        // header (h-14 on <sm, h-16 above) plus a small breathing
        // gap. Tightened from scroll-mt-24 to match case-study sections.
        "mt-12 scroll-mt-20 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl",
        className,
      )}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      {...props}
      className={cn(
        "mt-10 scroll-mt-20 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-foreground sm:text-3xl",
        className,
      )}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      {...props}
      className={cn(
        "mt-8 scroll-mt-20 text-xl font-semibold leading-snug text-foreground",
        className,
      )}
    />
  ),
  h4: ({ className, ...props }) => (
    <h4
      {...props}
      className={cn(
        "mt-6 scroll-mt-20 text-lg font-semibold leading-snug text-foreground",
        className,
      )}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      {...props}
      className={cn("mt-5 text-base leading-7 text-foreground/90", className)}
    />
  ),
  a: ({ className, href, children, ...props }) => {
    const external = typeof href === "string" && /^https?:\/\//i.test(href);
    return (
      <a
        {...props}
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={cn(
          "text-foreground underline decoration-ring/60 underline-offset-4 transition-colors hover:decoration-ring",
          className,
        )}
      >
        {children}
      </a>
    );
  },
  ul: ({ className, ...props }) => (
    <ul
      {...props}
      className={cn(
        "mt-5 ml-6 list-disc space-y-2 text-base leading-7 text-foreground/90 marker:text-muted-foreground",
        className,
      )}
    />
  ),
  ol: ({ className, ...props }) => (
    <ol
      {...props}
      className={cn(
        "mt-5 ml-6 list-decimal space-y-2 text-base leading-7 text-foreground/90 marker:font-mono marker:text-xs marker:text-muted-foreground",
        className,
      )}
    />
  ),
  li: ({ className, ...props }) => (
    <li {...props} className={cn("pl-1", className)} />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      {...props}
      className={cn(
        "mt-6 border-l-2 border-ring/60 pl-5 text-base italic leading-7 text-muted-foreground",
        className,
      )}
    />
  ),
  hr: ({ className, ...props }) => (
    <hr
      {...props}
      aria-hidden="true"
      className={cn("my-10 border-border/70", className)}
    />
  ),
  code: ({ className, children, ...props }) => {
    // react-markdown renders fenced code as `<pre><code>…</code></pre>`
    // and inline code as bare `<code>`. v9 doesn't expose a parent
    // pointer in the component props, so detect "fenced" via two
    // signals:
    // 1. a `language-*` className (set when the fence has a hint)
    // 2. a children string containing a newline (set on every fence
    //    body, inline code never spans lines in practice)
    const hasNewline =
      typeof children === "string" && children.includes("\n");
    const isFenced = className?.startsWith("language-") || hasNewline;
    if (!isFenced) {
      return (
        <code
          {...props}
          className={cn(
            "rounded-sm border border-border/80 bg-muted/60 px-1.5 py-0.5 font-mono text-[0.85em] text-foreground",
            className,
          )}
        >
          {children}
        </code>
      );
    }
    return (
      <code {...props} className={cn("font-mono text-sm", className)}>
        {children}
      </code>
    );
  },
  pre: ({ className, ...props }) => (
    // `max-w-full` constrains the pre to the post body's column so a
    // long unbreakable string scrolls horizontally inside the column
    // rather than expanding the page on narrow viewports.
    <pre
      {...props}
      className={cn(
        "mt-6 max-w-full overflow-x-auto rounded-md border border-border bg-muted/50 p-4 font-mono text-sm leading-6",
        className,
      )}
    />
  ),
  table: ({ className, ...props }) => (
    <div className="mt-6 max-w-full overflow-x-auto rounded-md border border-border/70">
      <table
        {...props}
        className={cn(
          "w-full border-collapse text-left text-sm",
          className,
        )}
      />
    </div>
  ),
  th: ({ className, ...props }) => (
    <th
      {...props}
      className={cn(
        "border-b border-border px-3 py-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground",
        className,
      )}
    />
  ),
  td: ({ className, ...props }) => (
    <td
      {...props}
      className={cn("border-b border-border/60 px-3 py-2", className)}
    />
  ),
  img: ({ src, alt, className }) => {
    if (typeof src !== "string") return null;
    return (
      <span className="mt-6 block">
        <Image
          src={src}
          alt={alt ?? ""}
          width={1280}
          height={720}
          sizes="(min-width: 1024px) 800px, 100vw"
          className={cn(
            "h-auto w-full rounded-md border border-border bg-muted",
            className,
          )}
        />
        {alt ? (
          <span className="mt-2 block text-center font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            {alt}
          </span>
        ) : null}
      </span>
    );
  },
};

export function PostBody({ markdown, className }: PostBodyProps) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <Markdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </Markdown>
    </div>
  );
}
