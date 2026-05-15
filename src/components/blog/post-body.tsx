import { Fragment, type ComponentPropsWithoutRef } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import Image from "next/image";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypeShiki from "@shikijs/rehype";
import rehypeReact from "rehype-react";
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
 * - Code fences run through Shiki at build time (server-side) with
 *   a dual github-light / github-dark-default theme. The token
 *   colors are written as CSS variables (defaultColor: false) and
 *   swapped via the `.dark .shiki` rule in globals.css.
 */
const components = {
  h1: ({ className, ...props }: ComponentPropsWithoutRef<"h1">) => (
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
  h2: ({ className, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2
      {...props}
      className={cn(
        "mt-10 scroll-mt-20 font-heading text-2xl font-semibold tracking-tight text-foreground sm:text-3xl",
        className,
      )}
    />
  ),
  h3: ({ className, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3
      {...props}
      className={cn(
        "mt-8 scroll-mt-20 text-xl font-semibold leading-snug text-foreground",
        className,
      )}
    />
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
      className={cn("mt-5 text-base leading-7 text-foreground/90", className)}
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
        "mt-5 ml-6 list-disc space-y-2 text-base leading-7 text-foreground/90 marker:text-muted-foreground",
        className,
      )}
    />
  ),
  ol: ({ className, ...props }: ComponentPropsWithoutRef<"ol">) => (
    <ol
      {...props}
      className={cn(
        "mt-5 ml-6 list-decimal space-y-2 text-base leading-7 text-foreground/90 marker:font-mono marker:text-xs marker:text-muted-foreground",
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
        "mt-6 border-l-2 border-ring/60 pl-5 text-base italic leading-7 text-muted-foreground",
        className,
      )}
    />
  ),
  hr: ({ className, ...props }: ComponentPropsWithoutRef<"hr">) => (
    <hr
      {...props}
      aria-hidden="true"
      className={cn("my-10 border-border/70", className)}
    />
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
  pre: ({ className, ...props }: ComponentPropsWithoutRef<"pre">) => {
    // Shiki injects an inline `style="background-color: …"` on the
    // outer `<pre>`. Drop it so our `bg-muted/50` token wins without
    // needing `!important`. With `defaultColor: false`, token spans
    // carry their colors as `--shiki-light` / `--shiki-dark` CSS
    // custom properties (no inline `color`); the `.shiki` rule in
    // globals.css resolves the active theme via those vars.
    const { style: _ignore, ...rest } = props;
    void _ignore;
    return (
      // `max-w-full` constrains the pre to the post body's column so a
      // long unbreakable string scrolls horizontally inside the column
      // rather than expanding the page on narrow viewports.
      <pre
        {...rest}
        className={cn(
          "mt-6 max-w-full overflow-x-auto rounded-md border border-border bg-muted/50 p-4 font-mono text-sm leading-6",
          className,
        )}
      />
    );
  },
  table: ({ className, ...props }: ComponentPropsWithoutRef<"table">) => (
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
    const isPlaceholderAlt = /^(image( description)?|alt( text)?|cover)$/i.test(
      trimmed,
    );
    const showCaption = trimmed.length > 0 && !isPlaceholderAlt;
    return (
      <span className="mt-6 block">
        <Image
          src={src}
          alt={trimmed}
          width={1280}
          height={720}
          sizes="(min-width: 1024px) 800px, 100vw"
          className={cn(
            "h-auto w-full rounded-md border border-border bg-muted",
            className,
          )}
        />
        {showCaption ? (
          <span className="mt-2 block text-center font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
            {trimmed}
          </span>
        ) : null}
      </span>
    );
  },
};

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
      components,
    })
    .process(markdown);

  return (
    <div className={cn("max-w-3xl", className)}>
      {file.result as React.ReactNode}
    </div>
  );
}
