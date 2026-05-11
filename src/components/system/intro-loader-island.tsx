"use client";

import dynamic from "next/dynamic";

// Thin client island that defers the IntroLoader chunk until after
// hydration. The home page is a server component, so it can't call
// next/dynamic({ ssr: false }) directly — this wrapper lives in a
// client file so the import call is legal.
//
// Net effect: the motion/AnimatePresence code that powers the
// session-gated boot overlay is no longer in the home route's
// initial JS payload. It loads on demand the first time the
// component would render.
const IntroLoaderDynamic = dynamic(
  () => import("./intro-loader").then((mod) => mod.IntroLoader),
  { ssr: false },
);

export function IntroLoaderIsland() {
  return <IntroLoaderDynamic />;
}
