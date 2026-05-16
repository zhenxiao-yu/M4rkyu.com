import type { Metadata } from "next";
import localFont from "next/font/local";
import { JetBrains_Mono, Noto_Sans_SC, VT323 } from "next/font/google";
import { SmoothScroll } from "@/providers/smooth-scroll";
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

// Latin gets the preload-eligible subset; Google chunks CJK via unicode-range
// and loads chunks on demand when /zh glyphs render. preload: false so EN-only
// visitors don't pay a preload for a Latin face Satoshi already covers.
const notoSansSC = Noto_Sans_SC({
  variable: "--font-cjk",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Pixel display font — cyber-pixel UI layer. English-only:
// the `:lang(zh)` / `[lang^="zh"]` guard in globals.css rewires
// --font-pixel to --font-cjk on Chinese-language scopes.
const vt323 = VT323({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${clashDisplay.variable} ${cabinetGrotesk.variable} ${satoshi.variable} ${jetbrainsMono.variable} ${notoSansSC.variable} ${vt323.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-background text-foreground"
      >
        {/* Apply the stored / system theme BEFORE the first paint so
         * dark-mode loads don't flash light first. Rendered by the
         * server layout (not inside a client component) — keeps it
         * out of React's client-render warning path. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('theme');var m=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';var r=(!s||s==='system')?m:s;document.documentElement.setAttribute('data-theme',r);}catch(e){}})()`,
          }}
        />
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
