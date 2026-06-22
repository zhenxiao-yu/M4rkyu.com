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

// Clash Display now drives the BRAND/cyber wordmark (--font-wordmark), not the
// editorial display role — Fraunces owns headlines. next/font binds the font to
// this CSS var on <html>, and that binding is the real source of truth (it
// overrides the @theme token), so the role re-assignment happens HERE, not just
// in globals.css. The CJK guard rewires --font-wordmark → --font-cjk on /zh.
const clashDisplay = localFont({
  src: "../../public/fonts/clash-display/ClashDisplay-Variable.woff2",
  variable: "--font-clash",
  weight: "200 700",
  display: "swap",
  preload: true,
});

// Cabinet Grotesk is retired from the heading role (Fraunces serif owns h2-h4
// now). Kept loaded under a parked var so the file isn't fetched unless a future
// surface opts into --font-grotesk; nothing references it today.
const cabinetGrotesk = localFont({
  src: "../../public/fonts/cabinet-grotesk/CabinetGrotesk-Variable.woff2",
  variable: "--font-grotesk",
  weight: "100 900",
  display: "swap",
  preload: false,
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

// The editorial serif — now the typographic star. Fraunces drives BOTH the
// editorial display faces (`--font-display`/`--font-heading`) and long-form
// reading (`--font-prose`) on every theme; Clash Display is reserved for the
// brand/cyber wordmark via `--font-wordmark` (globals.css). The variable axes
// earn their keep: `opsz` lets one file read right at body size and dramatic
// at display size (`font-optical-sizing: auto`), while `SOFT`/`WONK` power the
// `.serif-morph` hover treatment. `wght` is intentionally NOT listed in `axes`
// (next/font rejects it for variable fonts) — omitting `weight` keeps the full
// 100–900 range. Now critical, so preload on; adjustFontFallback (default true)
// emits the metric-matched "Fraunces Fallback" to hold CLS. The CJK guard
// rewires --font-serif (and --font-display/-heading/-wordmark) to --font-cjk
// under :lang(zh), so Fraunces never paints on /zh.
const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  style: ["normal", "italic"],
  display: "swap",
  preload: true,
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
  // Descriptive fallback for any route without its own title; the home
  // route overrides this per-locale (absolute) via its generateMetadata.
  // The "2027" brand stamp lives on in the boot loader, OG card, and hero.
  title: {
    default: "ZhenXiao Mark Yu — Software, Games & Digital Art",
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
// chrome to match the active surface; values mirror the default
// (risograph) `--background` in globals.css (dark #080705 / light
// #f1ead9). It can't track the user's palette axis — head color is
// static — so the default palette is the right anchor.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#080705" },
    { media: "(prefers-color-scheme: light)", color: "#f1ead9" },
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
