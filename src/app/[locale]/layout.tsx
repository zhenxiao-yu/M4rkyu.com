import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { CommandPaletteProvider } from "@/components/system/command-palette-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { routing, type Locale } from "@/i18n/routing";

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

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <ThemeProvider>
        <TooltipProvider delayDuration={400} skipDelayDuration={150}>
          <CommandPaletteProvider>{children}</CommandPaletteProvider>
        </TooltipProvider>
      </ThemeProvider>
    </NextIntlClientProvider>
  );
}
