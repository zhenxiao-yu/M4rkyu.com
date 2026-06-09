import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import {
  Fraunces,
  JetBrains_Mono,
  Noto_Sans_SC,
  Shantell_Sans,
  VT323,
} from "next/font/google";
import { SmoothScroll } from "@/providers/smooth-scroll";
import { ThemeScript } from "@/components/theme/theme-script";
import { SITE_URL } from "@/lib/seo/site";
import "./globals.css";

const clashDisplay = localFont({
  src: "../../public/fonts/clash-display/ClashDisplay-Variable.woff2",
  variable: "--font-display",
  weight: "200 700",
  display: "swap",
  preload: true,
});

const cabinetGrotesk = localFont({
  src: "../../public/fonts/cabinet-grotesk/CabinetGrotesk-Variable.woff2",
  variable: "--font-heading",
  weight: "100 900",
  display: "swap",
});

const satoshi = localFont({
  src: [
    {
      path: "../../public/fonts/satoshi/Satoshi-Variable.woff2",
      style: "normal",
      weight: "300 900",
    },
    {
      path: "../../public/fonts/satoshi/Satoshi-VariableItalic.woff2",
      style: "italic",
      weight: "300 900",
    },
  ],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

// CJK font; preload off so EN-only visitors don't fetch a Latin face Satoshi already covers.
const notoSansSC = Noto_Sans_SC({
  variable: "--font-cjk",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Pixel display font (English-only); globals.css rewires --font-pixel to --font-cjk under :lang(zh).
const vt323 = VT323({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

// The "warm hand" — handwritten/marker voice for marginalia, captions,
// and asides (the human layer over the cyber machine). English-only;
// globals.css rewires --font-hand to --font-cjk under :lang(zh).
const shantellSans = Shantell_Sans({
  variable: "--font-hand",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Literary serif for long-form prose. English-only and only consumed by the
// editorial-leaning themes (Risograph, Editorial) via `--font-prose` in
// globals.css — so it's only fetched when one of those themes actually
// renders prose. preload off; the CJK guard rewires --font-serif to
// --font-cjk under :lang(zh).
const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "M4rkyu.com",
  authors: [{ name: "ZhenXiao Mark Yu", url: SITE_URL }],
  creator: "ZhenXiao Mark Yu",
  publisher: "ZhenXiao Mark Yu",
  category: "portfolio",
  keywords: [
    "ZhenXiao Mark Yu",
    "M4rkyu",
    "software engineer",
    "frontend developer",
    "game developer",
    "digital artist",
    "Next.js portfolio",
  ],
  manifest: "/manifest.webmanifest",
  title: {
    default: "M4rkyu.com 2027",
    template: "%s | ZhenXiao Mark Yu",
  },
  description:
    "A black-and-white cyber-art portfolio platform for ZhenXiao Mark Yu: software engineer, frontend developer, game developer, and digital artist.",
  alternates: {
    canonical: "/en",
    languages: {
      en: "/en",
      zh: "/zh",
    },
    types: {
      "application/rss+xml": "/feed.xml",
      "application/feed+json": "/feed.json",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_CA",
    alternateLocale: ["zh_CN"],
    siteName: "M4rkyu.com",
    title: "M4rkyu.com 2027",
    description:
      "Software engineering, game development, and digital art case studies by ZhenXiao Mark Yu.",
    url: SITE_URL,
    images: [
      {
        url: "/-/opengraph-image",
        width: 1200,
        height: 630,
        alt: "M4rkyu.com portfolio archive",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "M4rkyu.com 2027",
    description:
      "Software engineering, game development, and digital art case studies by ZhenXiao Mark Yu.",
    images: ["/-/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

// Next 16 takes viewport + theme-color via a dedicated `viewport`
// export (not `metadata`). theme-color paints the mobile browser
// chrome to match the active surface; values mirror `--background` in
// globals.css (dark #050505 / light #f5f3ee).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
    { media: "(prefers-color-scheme: light)", color: "#f5f3ee" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${clashDisplay.variable} ${cabinetGrotesk.variable} ${satoshi.variable} ${jetbrainsMono.variable} ${notoSansSC.variable} ${vt323.variable} ${shantellSans.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-background text-foreground"
      >
        <ThemeScript />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
