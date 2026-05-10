import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne, VT323 } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SmoothScroll } from "@/providers/smooth-scroll";
import { SITE_URL } from "@/lib/seo/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

// Pixel display font — phase 1 cyber-pixel layer. English-only:
// the `:lang(zh)` / `[lang^="zh"]` guard in globals.css rewires
// --font-pixel to the display/sans stack on Chinese-language scopes.
const vt323 = VT323({
  variable: "--font-pixel",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
    siteName: "M4rkyu.com",
    title: "M4rkyu.com 2027",
    description:
      "Software engineering, game development, and digital art case studies by ZhenXiao Mark Yu.",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
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
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${vt323.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-background text-foreground"
      >
        <SmoothScroll>{children}</SmoothScroll>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
