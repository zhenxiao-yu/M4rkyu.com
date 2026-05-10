import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { CommandPaletteProvider } from "@/components/system/command-palette-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { routing, type Locale } from "@/i18n/routing";
import { getPosts } from "@/lib/blog/get-posts";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages({ locale: locale as Locale });

  // Slim payload — only fields the palette indexes. Cached fetcher,
  // shared with /blog and /blog/[slug] within the same render.
  const posts = await getPosts();
  const palettePosts = posts.slice(0, 20).map((post) => ({
    slug: post.slug,
    title: post.title,
    category: post.category,
    tags: post.tags,
  }));

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <TooltipProvider delayDuration={400} skipDelayDuration={150}>
          <CommandPaletteProvider posts={palettePosts}>
            {children}
          </CommandPaletteProvider>
        </TooltipProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
