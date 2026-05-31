---
title: "Zero-CLS Images in Next.js 16: LQIP Blur-Up Done Right"
published: false
description: "Kill layout shift and the ugly image pop in Next.js 16 with reserved aspect ratios and a tiny base64 LQIP blur-up you generate at upload time."
tags: nextjs, performance, webdev, react
cover_image: https://images.unsplash.com/photo-1759719440814-bbb8cc5422c4?auto=format&fit=crop&w=1200&q=70
---

You scroll, you start reading the headline, and then a hero image finishes loading and shoves the whole paragraph down half a screen. You lose your place. On a slow connection it's worse: a gray box snaps to a fully sharp photo with a jarring *pop*, no easing, no warmth. I've shipped both of those bugs. They are the two failure modes of images on the web, and they have two different fixes that people constantly conflate.

The first is **layout shift** — the box wasn't reserved, so the page reflows. The second is the **pop** — the box was reserved, but the transition from "nothing" to "photo" is abrupt. You fix the first by reserving exact space. You fix the second with a Low-Quality Image Placeholder (LQIP) that blurs up into the real thing. Here's how I do both in Next.js 16, with real code from a portfolio site running React 19, Tailwind v4, and Supabase.

## Why this shows up in your Core Web Vitals

Layout shift is a tracked metric: **Cumulative Layout Shift (CLS)**. Google's guidance is blunt — you want CLS of **0.1 or less for at least 75% of page visits**, and anything above **0.25 is "poor"** ([web.dev](https://web.dev/articles/optimize-cls)). A single unreserved hero image can blow past 0.25 on its own, because the shift score scales with how much of the viewport moved and how far.

The pop is about a different vital, **Largest Contentful Paint (LCP)** — usually your hero image. You can't make the bytes arrive faster by wishing, but you *can* paint something meaningful immediately so the wait feels intentional instead of broken. That's the whole job of the blur-up.

> Reserving space is correctness; the blur-up is polish. Do the correctness part even if you skip the polish — a shifting layout is a bug, an abrupt pop is just unpolished.

## Reserve the box before a single byte loads

The root cause of image CLS is that the browser doesn't know how tall the image will be until it downloads enough of it. Give it the intrinsic `width` and `height` and it computes the aspect ratio up front, reserving the exact box ([web.dev](https://web.dev/articles/optimize-cls)). `next/image` leans on exactly this — from the v16 docs:

> The `width` and `height` properties represent the intrinsic image size in pixels. This property is used to infer the correct **aspect ratio** used by browsers to reserve space for the image and avoid layout shift during loading. It does not determine the rendered size of the image, which is controlled by CSS. ([Next.js docs](https://nextjs.org/docs/app/api-reference/components/image))

So the rule for a fixed, in-flow image is: pass real intrinsic dimensions, then let CSS size it responsively with `height: auto`.

```tsx
import Image from "next/image";

export function Figure({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={1600}
      height={900}
      sizes="(max-width: 768px) 100vw, 768px"
      style={{ width: "100%", height: "auto" }}
    />
  );
}
```

The `width={1600} height={900}` pair is what reserves a 16:9 box; the `style` makes it scale. Note `height: "auto"` — if you set a fixed width without it, you fight the aspect ratio and reintroduce shift. This is the App Router idiom in Next.js 16, and there's no `next/legacy/image` involved — that import was retired years ago, and `layout`/`objectFit` props went with it.

When you genuinely don't know the dimensions (user uploads, a CMS field with no metadata), reach for `fill` instead. The image expands to its parent, so **the parent** owns the reserved box:

```tsx
<div style={{ position: "relative", aspectRatio: "16 / 9" }}>
  <Image
    src={src}
    alt={alt}
    fill
    sizes="(max-width: 768px) 100vw, 768px"
    style={{ objectFit: "cover" }}
  />
</div>
```

The `position: relative` on the parent is mandatory for `fill` — the docs require the parent be `relative`, `fixed`, or `absolute` — and the CSS `aspect-ratio` is what holds the space open. Either path gets you a stable layout. Now for the part everyone gets wrong.

## Static imports get a blur for free. Remote images don't.

This is the single most common confusion, so let me state it plainly. With `placeholder="blur"`:

| Source | `blurDataURL` | What you do |
| --- | --- | --- |
| Static import (`import hero from "./hero.jpg"`) | Generated at build time, automatically | Nothing — just add `placeholder="blur"` |
| Remote / dynamic URL (Supabase, S3, a CMS) | **Not available** | You must supply `blurDataURL` yourself |

Straight from the v16 docs: if `src` is a static import of a `jpg`, `png`, `webp`, or `avif` file, `blurDataURL` is added automatically (unless the image is animated); but "if the image is dynamic or remote, you must provide `blurDataURL` yourself" ([Next.js docs](https://nextjs.org/docs/app/api-reference/components/image)).

So for a bundled asset, this just works:

```tsx
import Image from "next/image";
import hero from "@/assets/hero.jpg";

export function Hero() {
  return (
    <Image
      src={hero}
      alt="Studio desk at dusk"
      placeholder="blur" // blurDataURL comes from the static import
      sizes="100vw"
      style={{ width: "100%", height: "auto" }}
    />
  );
}
```

But almost nothing interesting is a static import. Real apps load user uploads and content from a database. Those are remote URLs, Next.js never sees the bytes at build time, and so there is no automatic blur. If you want the blur-up on those, you generate the placeholder yourself — ideally once, at upload time.

## Generate a tiny LQIP at upload time

The trick is to compute a *very* small version of the image — 16 to 20 pixels on the long edge — encode it as a base64 data URL, and store that string. The docs literally recommend "a very small image (10px or less)" because Next.js enlarges and blurs it anyway, and warns that "a large blurDataURL may hurt performance." We're talking a string of roughly 400–900 bytes, small enough to ship inline in the initial HTML.

I do it in the browser with a canvas downscale before the upload, so the server never has to touch image bytes. Here's the function:

```ts
// lib/lqip.ts
// Downscale an image File to a ~16px base64 LQIP using a canvas.
export async function makeLqip(file: File, maxEdge = 16): Promise<string> {
  const bitmap = await createImageBitmap(file);

  const scale = maxEdge / Math.max(bitmap.width, bitmap.height);
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D canvas context unavailable");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  // JPEG at low quality keeps the data URL tiny; next/image blurs it anyway.
  return canvas.toDataURL("image/jpeg", 0.5);
}
```

Two details I learned the hard way. First, `createImageBitmap` decodes off the main thread and is far less fiddly than juggling an `<img>` `onload`; it's been broadly supported for years. Second, keep the JPEG quality low (`0.5`) — at 16px the artifacts are invisible once blurred, and it shaves the string down. If you'd rather not hand-roll this, [Plaiceholder](https://github.com/joe-bell/plaiceholder) is the library the Next.js docs point at for server-side generation; the canvas approach just keeps the work on the client and out of your API.

You can sanity-check the output size before trusting it:

```ts
const lqip = await makeLqip(file);
console.log(`${(lqip.length / 1024).toFixed(2)} KB`); // expect well under 1 KB
```

## Store it next to the image

The placeholder belongs with the row that owns the image, as a nullable column. Nullable matters: old rows won't have one, and you want the UI to degrade cleanly rather than crash. In Supabase/Postgres:

```sql
alter table public.photos
  add column blur_data_url text;

-- A guardrail so a bloated placeholder never sneaks in.
-- ~2 KB of base64 is already generous for a 16px JPEG.
alter table public.photos
  add constraint blur_data_url_len check (
    blur_data_url is null or char_length(blur_data_url) <= 2048
  );
```

On upload, you compute the LQIP client-side and persist it in the same insert as the storage path:

```ts
const blur_data_url = await makeLqip(file);

const { error } = await supabase.from("photos").insert({
  storage_path: path,
  width: naturalWidth,
  height: naturalHeight,
  blur_data_url, // may be null for legacy/back-filled rows
});
```

Store the intrinsic `width` and `height` too — you need them anyway to reserve the box for remote images, exactly as the section above. One round trip, three columns, done.

## Render it so it degrades when absent

Now the payoff. The component reads `blurDataURL` from the row and only opts into `placeholder="blur"` when the string actually exists. When it's `null`, you fall back to `undefined`, which the docs define as `empty` — no placeholder, no error, just a plain load.

```tsx
import Image from "next/image";

type Photo = {
  url: string;
  alt: string;
  width: number;
  height: number;
  blurDataURL: string | null;
};

export function Photo({ url, alt, width, height, blurDataURL }: Photo) {
  return (
    <div style={{ position: "relative", aspectRatio: `${width} / ${height}` }}>
      <Image
        src={url}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        placeholder={blurDataURL ? "blur" : undefined}
        blurDataURL={blurDataURL ?? undefined}
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}
```

The conditional is the whole point. `placeholder={blurDataURL ? "blur" : undefined}` means a back-filled row with `null` simply loads without a blur instead of throwing — `placeholder="blur"` *requires* a `blurDataURL`, so guarding them together keeps you safe. The box is reserved by the parent's `aspect-ratio` regardless, so **CLS stays at zero whether or not the placeholder is there.** That separation is the design: correctness doesn't depend on polish.

### `sizes` is not optional, and here's why

That `sizes` string is doing real work. It tells the browser how wide the image renders at each breakpoint so it can pick the right candidate from the generated `srcset`. Skip it and, per the docs, "the browser assumes the image will be as wide as the viewport (100vw)" — meaning a thumbnail in a three-column grid downloads a full-width image. There's a second effect: with `sizes`, Next.js generates a full responsive `srcset` (640w, 750w, and so on); without it, you get a thin 1x/2x set meant for fixed-size images. Match the string to your actual layout. Mine reads "full width on phones, half on tablets, a third on desktop," which is exactly what that grid does.

## The LCP image: `preload`, not `priority`

Here's the Next.js 16 change that trips people up. By default `next/image` lazy-loads, which is correct for everything below the fold. But your above-the-fold hero is the LCP element, and you don't want it waiting to be discovered in the `<body>`. The old answer was `priority`. **In Next.js 16, `priority` is deprecated in favor of `preload`** ([Next.js docs](https://nextjs.org/docs/app/api-reference/components/image)) — same idea, clearer name. It injects a `<link rel="preload">` in the `<head>` so the fetch starts as early as possible.

```tsx
<Image
  src={hero}
  alt="Studio desk at dusk"
  placeholder="blur"
  preload // Next.js 16: replaces the deprecated `priority` prop
  sizes="100vw"
  style={{ width: "100%", height: "auto" }}
/>
```

Use it on exactly one thing — the LCP hero. If you slap it on a gallery, you preload a dozen images, saturate the connection, and make LCP *worse*. The docs are clear that when the LCP element varies by viewport you should reach for `loading="eager"` or `fetchPriority="high"` instead of a blanket `preload`. One last thing worth knowing: in Next.js 16 the `qualities` allowlist in `next.config.ts` is required (it defaults to `[75]`), so if you start passing `quality={90}` somewhere, add it to that list or the optimizer rejects it.

## The takeaway

Two bugs, two fixes, and they're independent. Reserve the box — intrinsic `width`/`height`, or a parent with `aspect-ratio` plus `fill` — and your CLS goes to zero today, no placeholder required. Then, for the remote images that make up real apps, generate a ~16px base64 LQIP at upload, store it in a nullable column, and render it through `placeholder={blurDataURL ? "blur" : undefined}` so missing data degrades to a clean load instead of a crash. Add `sizes` that matches your layout, and `preload` your one LCP hero. Ship it, open DevTools, throttle to Slow 4G, and watch the page hold perfectly still while a soft blur sharpens into the photo. That's the difference between a site that feels broken and one that feels deliberate.

---

*Cover photo by [Brooke Balentine](https://unsplash.com/@brookebalentine) on [Unsplash](https://unsplash.com/photos/abstract-black-and-white-motion-blur-10vvFMLIPdM).*
