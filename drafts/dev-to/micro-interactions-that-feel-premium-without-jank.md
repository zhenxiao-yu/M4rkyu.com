---
title: "Premium micro-interactions in React 19 (without the jank)"
published: false
description: "Three motion patterns I actually ship — a spring progress bar, a count-up that never re-renders, and a layoutId indicator — all reduced-motion-aware."
tags: react, webdev, css, javascript
cover_image: https://images.unsplash.com/photo-1771876002358-e870981466d8?w=1000&auto=format&fit=crop
---

There's a specific kind of bad animation I notice immediately: the count-up stat that stutters as it ticks, the progress bar that lags a frame behind your scroll, the "active" tab underline that snaps instead of glides. None of it is broken, exactly. It just feels cheap. And nine times out of ten, the cause is the same — the animation is being driven through React state, so every frame triggers a re-render, and the main thread can't keep up.

I build motion-heavy interfaces for a living, mostly in Next.js 16 and React 19, and I've landed on a small set of patterns that stay smooth because they *bypass React's render loop entirely*. They lean on [Motion](https://motion.dev) — the library formerly known as Framer Motion. It went independent and got renamed in 2025, so the package is now `motion` and the import you want is `motion/react`, not `framer-motion` ([the APIs are identical, only the import path changed](https://motion.dev/docs/react-quick-start)).

Here are three I reach for constantly, plus the reduced-motion discipline that should wrap all of them.

## The mental model: MotionValues over state

The single idea that fixes most jank: a **MotionValue** is a value Motion tracks outside of React. When it changes, Motion updates the DOM directly via `transform` or `opacity` — it does *not* call `setState`, so your component doesn't re-render. That's the whole trick. A number ticking from 0 to 4,200 should touch the DOM ~60 times a second and re-render React zero times.

> If a value changes every frame, it should live in a MotionValue, not in `useState`. State is for things that change when a user does something; MotionValues are for things that change continuously.

Keep that line in your head and the rest of this falls out naturally.

## 1. A reading-progress bar with `useScroll` + `useSpring`

The bar at the top of an article that fills as you read. The naive version listens to `scroll` events and sets state — which is exactly the re-render trap. Motion's [`useScroll`](https://motion.dev/docs/react-use-scroll) hands you scroll position *as a MotionValue* already, so there's nothing to re-render.

`useScroll` returns `scrollYProgress`, a MotionValue clamped to `0`–`1`. Pipe it straight into `scaleX` and you have a bar. But raw scroll progress tracks your finger 1:1, which reads a little mechanical. Wrapping it in [`useSpring`](https://motion.dev/docs/react-use-spring) adds just enough weight that it feels like it has momentum.

```tsx
"use client";

import { motion, useScroll, useSpring } from "motion/react";

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX, transformOrigin: "0%" }}
      className="fixed inset-x-0 top-0 z-50 h-1 bg-foreground/80"
    />
  );
}
```

Two details that matter. `transformOrigin: "0%"` makes it grow from the left instead of the center — easy to forget, very obvious when wrong. And `aria-hidden` because this is pure decoration; a screen reader announcing "progress bar, 14 percent" on every scroll tick is noise, not information.

This one is *safe under reduced motion*, and I'll come back to why. It reflects something the user is physically doing. It isn't animating on its own.

## 2. A count-up that animates only when you scroll to it

This is the pattern people get wrong most often, so it's worth doing carefully. You want a stat — "4,200 projects shipped" — that counts up, but only when it scrolls into view, and *without* hammering React with 60 re-renders a second.

Four hooks compose here:

- [`useInView`](https://motion.dev/docs/react-use-in-view) tells you when the element is on screen (returns a plain boolean).
- `useMotionValue` holds the live number, off to the side of React.
- `animate` drives that MotionValue from 0 to the target.
- `useTransform` formats the raw number into a rounded, comma-grouped string — also as a MotionValue.

The number lands in the DOM through `<motion.span>`, which subscribes to the formatted MotionValue and patches `textContent` directly. React renders this component **once**.

```tsx
"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";

export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const prefersReduced = useReducedMotion();

  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) =>
    Math.round(v).toLocaleString(),
  );

  useEffect(() => {
    if (!inView) return;

    // Reduced motion: skip the tween, just show the final number.
    if (prefersReduced) {
      count.set(to);
      return;
    }

    const controls = animate(count, to, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1], // expo-out: fast start, soft landing
    });
    return () => controls.stop();
  }, [inView, prefersReduced, to, count]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{rounded}</motion.span>
      {suffix}
    </span>
  );
}
```

A few things I learned the hard way:

- **`amount: 0.6`** means "fire when 60% of the element is visible." With `once: true`, it animates a single time and then stops observing — no replay every time the user scrolls back up, which gets annoying fast.
- **`tabular-nums`** (Tailwind's `font-variant-numeric: tabular-nums`) keeps each digit the same width. Without it, the number visibly jitters left and right as digits change width mid-count. This is the difference between "premium" and "why is it twitching."
- **Always return `controls.stop()`** from the effect. If the component unmounts mid-animation, you don't want a dangling tween writing to a dead node.

The reduced-motion branch is doing real work here: instead of a 1.4s tween, it snaps straight to the final value. The user still gets the information — they just don't get the autonomous movement.

## 3. A shared-layout active indicator with `layoutId`

The gliding pill or underline behind the active nav item. The temptation is to measure each item's position and animate `left`/`width` by hand. Don't. Motion's shared layout animations do it for you: give an element a `layoutId`, render it inside whichever item is active, and when "active" moves, Motion animates the element from its old box to its new box automatically. It's measuring `getBoundingClientRect` and tweening the delta under the hood — you just declare intent.

```tsx
"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const tabs = ["Work", "Notes", "Games", "Shop"] as const;

export function TabRail() {
  const [active, setActive] = useState<(typeof tabs)[number]>("Work");
  const prefersReduced = useReducedMotion();

  return (
    <nav className="flex gap-1 rounded-full bg-muted p-1">
      {tabs.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            onClick={() => setActive(tab)}
            className="relative rounded-full px-4 py-1.5 text-sm font-medium"
          >
            {isActive && (
              <motion.span
                layoutId="tab-pill"
                className="absolute inset-0 rounded-full bg-background shadow-sm"
                // Skip the glide for reduced motion; the pill still
                // moves, it just teleports instead of sliding.
                transition={
                  prefersReduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 380, damping: 32 }
                }
              />
            )}
            <span className="relative z-10">{tab}</span>
          </button>
        );
      })}
    </nav>
  );
}
```

The pill (`layoutId="tab-pill"`) is rendered inside whatever button is active. Click another tab, and because only one element in the tree owns that `layoutId`, Motion treats it as the *same* element moving and springs it across. The label sits at `z-10` so the pill slides behind the text, not over it. Note the pill is `position: absolute` inside a `position: relative` button — `layoutId` animates layout boxes, so both elements need to participate in positioning for the measurement to be correct.

## Reduced motion is a feature, not a fallback

You'll have noticed `useReducedMotion()` threading through all three. This is the part I care about most, because "premium" and "accessible" are the same goal, not competing ones. Roughly one in three people has *some* motion sensitivity setting engaged, and for some of them, the wrong animation is genuinely nauseating.

The principle I follow:

> **Scroll-reflective motion is fine under reduced motion. Autonomous motion is not.**

If the user is driving it — scrolling, dragging, hovering — keeping the motion is honest feedback. The progress bar in §1 stays. But anything that moves *on its own* — a number tweening up, a pill springing sideways, a parallax drift — should be cut or made instant when `prefers-reduced-motion: reduce` is set. That's why the count-up snaps to its value and the tab pill teleports.

| Pattern | Driven by | Under reduced motion |
| --- | --- | --- |
| Reading progress bar | User scroll | Keep it (reflective) |
| Count-up number | Time / autoplay | Snap to final value |
| `layoutId` pill | State change | Teleport, no glide |

For pure-CSS bits, lean on Tailwind's built-in variants rather than re-checking the media query in JS. `motion-safe:` only applies the class when motion is *allowed*; `motion-reduce:` only when it's *reduced*. They map directly to the `prefers-reduced-motion` media feature.

```tsx
<button
  className="
    transition-transform
    motion-safe:hover:-translate-y-0.5
    motion-reduce:transition-none
  "
>
  Hover me
</button>
```

Here the lift only happens for users who want motion, and the transition is fully disabled (no fade either) for users who don't. Pairing `useReducedMotion()` for the JS-driven MotionValue work with `motion-safe:` / `motion-reduce:` for the CSS-driven hover and focus states covers both halves cleanly.

One more thing worth saying out loud: respect the OS setting; don't add your own "disable animations" toggle as if it's a substitute. People already set `prefers-reduced-motion` once, at the system level. Reading it is the whole contract.

## What actually makes it feel premium

It's not the spring physics or the easing curve, in the end. It's three quieter decisions: animate transforms and opacity so the work stays off the main thread, route per-frame values through MotionValues so React never re-renders during the animation, and treat reduced motion as a real design state instead of an afterthought. Get those right and even a plain fade feels deliberate.

Start with the count-up — it's the one that most visibly separates a polished UI from a janky one, and it's maybe twenty lines. Steal it, drop in your own numbers, and turn on reduced motion in your OS to watch it do the right thing.

---

*Cover photo by [Liana S](https://unsplash.com/photos/abstract-streaks-of-light-in-dark-background-BV9vbI8ZkZM) on [Unsplash](https://unsplash.com).*
