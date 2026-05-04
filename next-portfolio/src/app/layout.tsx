import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.m4rkyu.com"),
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
    url: "https://www.m4rkyu.com",
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
