import type { ReactNode } from "react";
import type { Locale } from "@/i18n/routing";
import { Header } from "./header";
import { Footer } from "./footer";
import { FooterReveal } from "./footer-reveal";
import { PageFade } from "@/components/motion/page-fade";
import { RouteAttribute } from "@/components/system/route-attribute";
import { ScrollProgress } from "@/components/system/scroll-progress";
import { ClickSpark } from "@/components/ui/magic/click-spark";
import { CursorReticle } from "@/components/ui/magic/cursor-reticle";
import { EditorialFrame } from "./editorial-frame";

export async function PageShell({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <RouteAttribute />
      <ScrollProgress />
      {/* Site-wide pointer chrome. ClickSpark owns the press ripple + the
        * soft hover ink-halo at the cursor point. CursorReticle adds the
        * targeting-computer lock-on: a faint four-corner reticle that blooms
        * to enclose interactive elements (echoing the CRT boot sequence).
        * It is ADDITIVE — the native cursor stays — and replaces the old
        * mix-blend-difference CursorTrail that read as a floating artifact.
        * The two read as distinct layers (halo = soft fill at the cursor;
        * brackets = hairline corners outside the element), never a blob. */}
      <ClickSpark />
      <CursorReticle />
      <EditorialFrame />
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <Header locale={locale} />
      {/* The header is sticky and reserves `var(--dock-h)` (60px) of
        * flow space. Pull `<main>` up by that same amount so each
        * page's first section (with its cyber-grid / noise / scanline
        * overlay) extends to y=0 of the viewport and renders behind
        * the glass dock — eliminates the body-coloured "bar" that
        * would otherwise sit above every hero. The CSS variable lives
        * on `:root` in globals.css so dock height + main pull-up stay
        * in sync from one edit. */}
      <main
        id="main-content"
        className="flex-1"
        style={{ marginTop: "calc(var(--dock-h) * -1)" }}
      >
        <PageFade>{children}</PageFade>
      </main>
      <FooterReveal>
        <Footer locale={locale} />
      </FooterReveal>
    </div>
  );
}
