import type { ReactNode } from "react";
import type { Locale } from "@/i18n/routing";
import { Header } from "./header";
import { Footer } from "./footer";
import { PageFade } from "@/components/motion/page-fade";
import { RouteAttribute } from "@/components/system/route-attribute";

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
      <Footer locale={locale} />
    </div>
  );
}
