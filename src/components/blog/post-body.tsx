import {
  Fragment,
  isValidElement,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import Image from "next/image";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeShiki from "@shikijs/rehype";
import rehypeReact from "rehype-react";
import { cn } from "@/lib/utils";
import {
  createHeadingIdGenerator,
  extractMarkdownHeadings,
} from "@/lib/blog/headings";
import { CodeBlock } from "./code-block";

export type { PostHeading } from "@/lib/blog/headings";
export const extractHeadings = extractMarkdownHeadings;

interface PostBodyProps {
  markdown: string;
  className?: string;
}

/** Flatten a React node tree to plain text — used to derive heading ids. */
function textContent(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textContent).join("");
  if (isValidElement(node)) {
    return textContent((node.props as { children?: ReactNode }).children);
  }
  return "";
}

// Hosts whitelisted in next.config.ts under `images.remotePatterns`.
// MDX images from one of these get the full `next/image` optimizer;
// images from other hosts (dev.to posts often embed author CDNs like
// blog.openreplay.com) fall back to a plain `<img>` so they always
// render instead of failing the next/image host check. Keep this in
// sync with next.config.ts — divergence means a configured host
// silently loses optimization here.
const OPTIMIZED_IMAGE_HOSTS = new Set([
  "media.dev.to",
  "media2.dev.to",
  "media3.dev.to",
  "dev-to-uploads.s3.amazonaws.com",
]);

function canOptimize(src: string): boolean {
  if (src.startsWith("/")) return true; // local /public asset
  try {
    return OPTIMIZED_IMAGE_HOSTS.has(new URL(src).hostname);
  } catch {
    return false;
  }
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
 * - Code fences run through Shiki at build time (server-side) with
 *   a dual github-light / github-dark-default theme. The token
 *   colors are written as CSS variables (defaultColor: false) and
 *   swapped via the `.dark .shiki` rule in globals.css.
 */
function createPostComponents() {
  const makeHeadingId = createHeadingIdGenerator();

  return {
    h1: ({ className, ...props }: ComponentPropsWithoutRef<"h1">) => (
      <h1
        {...props}
        className={cn(
          // scroll-mt-20 clears the sticky header (h-14/h-16) with a small breathing gap.
          "mt-12 scroll-mt-20 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl",
          className,
        )}
      />
    ),
    h2: ({ className, children, ...props }: ComponentPropsWithoutRef<"h2">) => (
      <h2
        {...props}
        id={makeHeadingId(textContent(children))}
        className={cn(
          "mt-10 scroll-mt-20 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl",
          className,
        )}
      >
        {children}
      </h2>
    ),
    h3: ({ className, children, ...props }: ComponentPropsWithoutRef<"h3">) => (
      <h3
        {...props}
        id={makeHeadingId(textContent(children))}
        className={cn(
          "mt-8 scroll-mt-20 text-xl font-semibold leading-snug text-foreground",
          className,
        )}
      >
        {children}
      </h3>
    ),
    h4: ({ className, ...props }: ComponentPropsWithoutRef<"h4">) => (
      <h4
        {...props}
        className={cn(
          "mt-6 scroll-mt-20 text-lg font-semibold leading-snug text-foreground",
          className,
        )}
      />
    ),
    p: ({ className, ...props }: ComponentPropsWithoutRef<"p">) => (
      <p
        {...props}
        className={cn(
          "mt-5 text-[1.03rem] leading-8 text-foreground/90",
          className,
        )}
      />
    ),
    a: ({
      className,
      href,
      children,
      ...props
    }: ComponentPropsWithoutRef<"a">) => {
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
    ul: ({ className, ...props }: ComponentPropsWithoutRef<"ul">) => (
      <ul
        {...props}
        className={cn(
          "mt-5 ml-6 list-disc space-y-2 text-[1.03rem] leading-8 text-foreground/90 marker:text-muted-foreground",
          className,
        )}
      />
    ),
    ol: ({ className, ...props }: ComponentPropsWithoutRef<"ol">) => (
      <ol
        {...props}
        className={cn(
          "mt-5 ml-6 list-decimal space-y-2 text-[1.03rem] leading-8 text-foreground/90 marker:font-mono marker:text-xs marker:text-muted-foreground",
          className,
        )}
      />
    ),
    li: ({ className, ...props }: ComponentPropsWithoutRef<"li">) => (
      <li {...props} className={cn("pl-1", className)} />
    ),
    blockquote: ({
      className,
      ...props
    }: ComponentPropsWithoutRef<"blockquote">) => (
      <blockquote
        {...props}
        className={cn(
          "mt-6 border-l-2 border-ring/60 pl-5 text-[1.03rem] italic leading-8 text-muted-foreground",
          className,
        )}
      />
    ),
    hr: () => (
      // Editorial divider — a centred star mark (the site's StarGlyph motif)
      // flanked by fading rules, instead of a bare full-width line.
      <div
        aria-hidden="true"
        className="my-12 flex items-center justify-center gap-4 text-muted-foreground/45"
      >
        <span className="h-px w-14 bg-linear-to-r from-transparent to-border" />
        <span className="font-mono text-[0.7rem] tracking-[0.3em]">✦</span>
        <span className="h-px w-14 bg-linear-to-l from-transparent to-border" />
      </div>
    ),
    code: ({
      className,
      children,
      ...props
    }: ComponentPropsWithoutRef<"code">) => {
      // After rehype-shiki runs, fenced code lives inside `<pre><code
      // class="shiki shiki-themes ...">…<span style="…">tokens</span>…
      // </code></pre>`. Inline code stays as a bare `<code>` with no
      // `language-*` and no `shiki` class. So:
      //   - inline = no `language-` AND no `shiki`
      //   - fenced = anything else (pass children through unchanged so
      //     Shiki's colored token spans survive intact).
      const cls = className ?? "";
      const isShiki = cls.split(/\s+/).includes("shiki");
      const hasLanguage = /(^|\s)language-/.test(cls);
      const isFenced = isShiki || hasLanguage;
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
    pre: ({
      className,
      children,
      ...props
    }: ComponentPropsWithoutRef<"pre">) => {
      // Shiki injects an inline `style="background-color: …"` on the
      // outer `<pre>`. Drop it so our `bg-muted/50` token wins without
      // needing `!important`. With `defaultColor: false`, token spans
      // carry their colors as `--shiki-light` / `--shiki-dark` CSS
      // custom properties (no inline `color`); the `.shiki` rule in
      // globals.css resolves the active theme via those vars.
      const { style: _ignore, ...rest } = props;
      void _ignore;
      // CodeBlock (client) owns the chrome — language badge + copy button —
      // and re-applies the column/scroll styles. The Shiki-coloured token
      // spans pass through as `children`, untouched.
      return (
        <CodeBlock className={className} preProps={rest}>
          {children}
        </CodeBlock>
      );
    },
    table: ({ className, ...props }: ComponentPropsWithoutRef<"table">) => (
      <div className="mt-6 max-w-full overflow-x-auto rounded-md border border-border/70">
        <table
          {...props}
          className={cn("w-full border-collapse text-left text-sm", className)}
        />
      </div>
    ),
    th: ({ className, ...props }: ComponentPropsWithoutRef<"th">) => (
      <th
        {...props}
        className={cn(
          "border-b border-border px-3 py-2 font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground",
          className,
        )}
      />
    ),
    td: ({ className, ...props }: ComponentPropsWithoutRef<"td">) => (
      <td
        {...props}
        className={cn("border-b border-border/60 px-3 py-2", className)}
      />
    ),
    img: ({ src, alt, className }: ComponentPropsWithoutRef<"img">) => {
      if (typeof src !== "string") return null;
      // dev.to's MDX template seeds images with placeholder alts like
      // "Image description". Surfacing those as visible captions duplicates
      // the alt for AT users (axe `image-redundant-alt`) without adding
      // information, so we hide the caption when the alt is empty or a
      // known placeholder phrase. Curated captions still render.
      const trimmed = alt?.trim() ?? "";
      const isPlaceholderAlt =
        /^(image( description)?|alt( text)?|cover)$/i.test(trimmed);
      const showCaption = trimmed.length > 0 && !isPlaceholderAlt;
      const figureClass = cn(
        "h-auto w-full rounded-md border border-border bg-muted",
        className,
      );

      return (
        <span className="mt-6 block">
          {canOptimize(src) ? (
            <Image
              src={src}
              alt={trimmed}
              width={1280}
              height={720}
              sizes="(min-width: 1024px) 800px, 100vw"
              className={figureClass}
            />
          ) : (
            // External-host fallback — author CDNs embedded in dev.to
            // posts can't all be whitelisted in next.config without
            // turning that file into a maintenance log. Plain <img>
            // loses Next's AVIF conversion for these but always renders.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={src}
              alt={trimmed}
              loading="lazy"
              decoding="async"
              className={figureClass}
            />
          )}
          {showCaption ? (
            <span className="mt-2 block text-center font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
              {trimmed}
            </span>
          ) : null}
        </span>
      );
    },
  };
}

export async function PostBody({ markdown, className }: PostBodyProps) {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeShiki, {
      themes: { light: "github-light", dark: "github-dark-default" },
      defaultColor: false,
    })
    .use(rehypeReact, {
      Fragment,
      jsx,
      jsxs,
      components: createPostComponents(),
    })
    .process(markdown);

  return (
    // `font-prose` = the body reading face: the literary serif (Fraunces) on
    // every theme except Terminal (which reverts to sans — a console reads
    // wrong in serif). Headings/code/tables set their own font-* so they stay
    // put; only the running prose (p, li, blockquote) picks up the serif.
    // max-w-[65ch] keeps long-form lines comfortably readable.
    <div className={cn("max-w-[65ch] font-prose", className)}>
      {file.result as React.ReactNode}
    </div>
  );
}
