---
title: "Tailwind CSS v4: The Changes That Actually Matter"
published: false
description: "A practical field guide to Tailwind v4 for devs coming from v3 — CSS-first config, native theme variables, container queries, and the migration gotchas."
tags: tailwindcss, css, webdev, frontend
cover_image: https://images.unsplash.com/photo-1761063198766-9df7175dd089?q=80&w=1600&auto=format&fit=crop
---

For years my `tailwind.config.js` was the file I dreaded touching. Every new color, every breakpoint, every font family meant hopping out of CSS, into a JavaScript object, restarting the dev server because the config didn't hot-reload cleanly, and then squinting at a merge conflict three sprints later. The styling lived in CSS but the *truth* about the styling lived in a JS file nobody wanted to own.

Tailwind v4 deleted that file from my projects. Not "made it optional" — I genuinely don't have one anymore. That's the headline, and it changes how the whole thing feels day to day. I've migrated a couple of real Next.js apps now (this portfolio is one of them), so here's what actually mattered versus what was just changelog noise.

## The engine: a real rewrite, not a tune-up

v4 ships [a ground-up rewrite of the framework](https://tailwindcss.com/blog/tailwindcss-v4). The new engine — previewed under the name **Oxide** at Tailwind Connect — moves the expensive, parallelizable work into Rust while keeping the core in TypeScript so plugins still work. Its only dependency is Lightning CSS.

The numbers are real and you feel them. From the official v4 post: full builds are about **3.8x faster** (378ms → 100ms), and the case that matters most for daily work — an incremental rebuild that produces no new CSS — is **over 180x faster**, landing in *microseconds* instead of tens of milliseconds.

> The win isn't "my CI is faster." It's that the save-to-paint loop stopped having a Tailwind-shaped pause in it. You stop noticing the build, which is the whole point of a build tool.

## CSS-first config: `@theme` replaces the JS file

This is the change I'd lead with if you only read one section. The three `@tailwind` directives and the `tailwind.config.js` object are both gone. You import Tailwind as plain CSS and declare your design system in an `@theme` block.

Here's the entire setup, before and after:

```css
/* v3 — app.css + a separate tailwind.config.js */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

```css
/* v4 — one file, no JS config */
@import "tailwindcss";

@theme {
  --font-display: "Satoshi", sans-serif;
  --breakpoint-3xl: 120rem;
  --color-brand-100: oklch(0.97 0.02 264);
  --color-brand-500: oklch(0.62 0.18 264);
  --color-brand-900: oklch(0.32 0.12 264);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
}
```

The naming is a convention, not free-form. A `--color-*` entry generates `bg-*`, `text-*`, `border-*` and friends; `--breakpoint-3xl` gives you a `3xl:` variant; `--font-*` feeds `font-*`. So `--color-brand-500` immediately gives you `bg-brand-500`, `text-brand-500`, `hover:border-brand-500`, no extra wiring. Define the token, get the utilities.

You can still use a JS config if you have to — there's a `@config "../tailwind.config.js";` escape hatch — but I haven't needed it on a greenfield project.

## Design tokens that are actually CSS variables

This one quietly fixed a class of problems I'd been working around for years. v4 takes every theme token and [emits it as a native CSS custom property on `:root`](https://tailwindcss.com/blog/tailwindcss-v4). The `@theme` block above produces, automatically:

```css
:root {
  --font-display: "Satoshi", sans-serif;
  --color-brand-500: oklch(0.62 0.18 264);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
}
```

Which means your design tokens are readable *at runtime*, by anything — arbitrary values, hand-written CSS, a Framer Motion animation, a `<canvas>` that needs your accent color. No more importing the resolved config into JS just to learn what `brand-500` evaluates to:

```jsx
// Read a Tailwind token at runtime — no config import, no hardcoded hex
const accent = getComputedStyle(document.documentElement)
  .getPropertyValue("--color-brand-500")
  .trim();
```

And because the tokens are plain variables, theming with `color-mix()` or overriding a few of them under `[data-theme="dark"]` is just CSS now, not a plugin.

## Container queries are built in

In v3 this was a separate plugin (`@tailwindcss/container-queries`). In v4 it's [core](https://tailwindcss.com/blog/tailwindcss-v4) — delete the plugin. Mark a parent with `@container`, then size children against the *container* instead of the viewport with `@sm:`, `@md:`, `@lg:`:

```html
<div class="@container">
  <!-- stacks when the CARD is narrow, regardless of screen width -->
  <article class="grid grid-cols-1 gap-4 @md:grid-cols-3">
    <img class="@md:col-span-1" src="/cover.jpg" alt="" />
    <div class="@md:col-span-2">…</div>
  </article>
</div>
```

There's a `@max-*` direction and arbitrary sizes (`@min-[475px]:`), plus named containers (`@container/sidebar` paired with `@md/sidebar:`) for nested cases. The mental shift is real: a card component finally styles itself by *its own* width, so the same component drops into a sidebar or a full-bleed section and just adapts. No more threading screen breakpoints through props.

## `@utility` for custom utilities

`@apply` still exists, but the blessed way to add a first-class utility — one that composes with `hover:`, `focus:`, `lg:`, and the rest — is the [`@utility` directive](https://tailwindcss.com/docs/functions-and-directives):

```css
@utility tab-4 {
  tab-size: 4;
}

/* now this works: hover:tab-4, lg:tab-4, etc. */
```

It handles real-world cases cleanly. Here's a content-visibility helper I actually ship, and a token-aware focus ring:

```css
@utility content-auto {
  content-visibility: auto;
}

@utility focus-ring {
  outline: 2px solid var(--color-brand-500);
  outline-offset: 2px;
}
```

The difference from a plain CSS class is that `@utility` output lands in the right cascade layer and is variant-aware, so it behaves like a built-in instead of fighting specificity with Tailwind's own classes.

## Dynamic values without configuring scales

v4 stopped requiring you to pre-register every step of a scale. Grid columns, spacing, and similar utilities are now computed on demand, so `grid-cols-15` or `mt-17` just work — no `theme.extend` entry first:

```html
<div class="grid grid-cols-15 gap-2">…</div>
<div class="mt-17 w-29">…</div>
```

Under the hood spacing derives from a single `--spacing` variable, so `mt-17` resolves to `calc(var(--spacing) * 17)`. Arbitrary values (`top-[117px]`, `bg-[#0a0a0a]`) are still there for the genuine one-offs — but you reach for them far less, because the common "I just need one more step" case is handled.

## The migration: what actually bit me

The [upgrade tool](https://tailwindcss.com/docs/upgrade-guide) does most of the work. Run it on a clean branch:

```bash
npx @tailwindcss/upgrade
```

It needs Node 20+, ports your JS config to an `@theme` block, swaps the directives for `@import "tailwindcss"`, and updates renamed classes across your templates. Review the diff — it's usually close to done, but not always perfect.

The gotcha that got me was the **renamed default scales**. Tailwind shifted the shadow, radius, and blur scales by one step. The bare names still exist but now mean what the old `-sm` meant, so anything you didn't migrate renders subtly wrong rather than breaking loudly.

| What you wrote (v3) | What it is now (v4) |
| --- | --- |
| `shadow-sm` | `shadow-xs` |
| `shadow` | `shadow-sm` |
| `rounded` | `rounded-sm` |
| `blur` | `blur-sm` |
| `outline-none` | `outline-hidden` |
| `ring` | `ring-3` |
| `bg-opacity-50` | `bg-black/50` |
| `flex-shrink-0` | `shrink-0` |

The opacity utilities (`bg-opacity-*`, `text-opacity-*`, etc.) and the `flex-shrink-*` / `flex-grow-*` longhands were *removed*, not renamed — use the `/` opacity modifier and `shrink-*` / `grow-*`. The auto-upgrade catches most of these, but hand-written classes built from string concatenation slip through, so grep for them.

## The honest trade-off: browser support

This is the real cost, and you should make the call deliberately. v4 leans on `@property` and `color-mix()` for core behavior, so it [targets modern browsers only](https://tailwindcss.com/docs/upgrade-guide): **Safari 16.4+, Chrome 111+, and Firefox 128+**. There is no polyfill path — older browsers won't render correctly.

For a 2026 product that tracks evergreen browsers, that's a non-issue; those versions are well past Baseline. But if you're on the hook for an enterprise contract that still lists Safari 15 or some locked-down embedded webview, v4 is not your release. Stay on v3.4 — it's stable and maintained — and revisit later. Don't migrate on vibes; check your actual analytics first.

## What I'd tell a v3 dev

Migrate a real project, not a toy, and start with the upgrade tool on a branch. The CSS-first config is the change that pays off every single day — your design tokens stop being a JavaScript secret and become plain CSS variables you can read anywhere. Container queries and `@utility` are the features I keep reaching for that I didn't expect to. The renamed-scales gotcha is the one to actually watch during the port; everything else the tool handles.

The friction I opened with — owning a JS config file just to declare a color — is the thing that's gone. That alone was worth the afternoon it took.

---

*Cover photo by [Rini Nur Rohmah](https://unsplash.com/@rininrr_) on [Unsplash](https://unsplash.com/).*
