import type { Metadata } from "next";
import { Fraunces, Quicksand, Space_Mono } from "next/font/google";
import { DateInvite } from "./invite";

// Scoped, romantic type stack — lives only on this secret page and never
// touches the portfolio's global font tokens.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  display: "swap",
});
const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-space-mono",
  display: "swap",
});

// Secret page: keep it out of search, sitemaps, and OG crawls.
export const metadata: Metadata = {
  title: "🤍",
  robots: { index: false, follow: false, nocache: true },
};

export default function ForYouPage() {
  return (
    <div className={`${fraunces.variable} ${quicksand.variable} ${spaceMono.variable}`}>
      <DateInvite />
    </div>
  );
}
