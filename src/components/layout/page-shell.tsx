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
      <main id="main-content" className="flex-1">
        <PageFade>{children}</PageFade>
      </main>
      <Footer locale={locale} />
    </div>
  );
}
