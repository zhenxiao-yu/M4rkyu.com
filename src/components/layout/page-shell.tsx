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
      {/* The header is sticky and reserves 60px of flow space. Pull
        * `<main>` up by the same 60px so each page's first section
        * (with its cyber-grid / noise / scanline overlay) extends to
        * y=0 of the viewport and renders behind the glass dock —
        * eliminates the body-coloured "bar" that would otherwise sit
        * above every hero. Section content uses `py-16` (64px), which
        * leaves a 4px clearance below the 60px dock end. */}
      <main id="main-content" className="-mt-15 flex-1">
        <PageFade>{children}</PageFade>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
