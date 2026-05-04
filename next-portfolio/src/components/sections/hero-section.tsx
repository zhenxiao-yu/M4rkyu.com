"use client"

import { motion } from "motion/react"
import { useTranslations } from "next-intl"
import { ArrowRight, Code } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Marquee } from "@/components/ui/marquee"
import { Link } from "@/i18n/navigation"
import type { Locale } from "@/i18n/routing"

const ease = [0.2, 0.7, 0.2, 1] as const

const marqueeItems = [
  "Software Engineer",
  "Frontend Developer",
  "Game Developer",
  "Digital Artist",
  "Next.js",
  "TypeScript",
  "React",
  "Unity",
  "Tailwind CSS",
  "Creative Systems",
  "UI Design",
  "Web Apps",
]

const headlineLines = [
  { text: "Engineer.", dim: false },
  { text: "Artist.",   dim: true  },
  { text: "Designer.", dim: false },
]

const sideItems = [
  { n: "01", label: "software"   },
  { n: "02", label: "games"      },
  { n: "03", label: "art"        },
  { n: "04", label: "interfaces" },
]

export function HeroSection({ locale }: { locale: Locale }) {
  const t = useTranslations("Home")

  return (
    <section className="relative overflow-hidden border-b">
      {/* atmospheric layers */}
      <div className="absolute inset-0 bg-cyber-grid opacity-40" aria-hidden="true" />
      <div className="noise-layer absolute inset-0" aria-hidden="true" />
      <div className="scanline-layer absolute inset-0 opacity-35" aria-hidden="true" />

      {/* main grid */}
      <div className="relative mx-auto grid min-h-[calc(100dvh-4rem-2.75rem)] w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_400px] lg:gap-16 lg:px-8">

        {/* ── left ── */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease }}
            className="mb-7 flex flex-wrap items-center gap-2.5"
          >
            <span className="font-mono text-[0.68rem] uppercase tracking-[0.32em] text-muted-foreground">
              ZX Mark Yu
            </span>
            <span className="text-muted-foreground/40 font-mono text-[0.68rem]">/</span>
            <span className="rounded border border-ring/50 px-2 py-0.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ring">
              2027 Prototype
            </span>
          </motion.div>

          <h1 className="text-[clamp(3.75rem,9.5vw,8rem)] font-[800] leading-[0.86] tracking-[-0.025em]">
            {headlineLines.map(({ text, dim }, i) => (
              <span key={text} className="block overflow-hidden">
                <motion.span
                  className={`block ${dim ? "text-muted-foreground/45" : ""}`}
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.65, delay: 0.12 + i * 0.14, ease }}
                >
                  {text}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7, ease }}
            className="mt-9 max-w-md text-lg leading-8 text-muted-foreground"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.88, ease }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Button asChild size="lg">
              <Link href="/projects" locale={locale}>
                {t("primaryCta")}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/portal" locale={locale}>
                {t("portalCta")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="ghost">
              <a href="https://github.com/zhenxiao-yu" target="_blank" rel="noopener noreferrer">
                <Code className="size-4" />
                GitHub
              </a>
            </Button>
          </motion.div>
        </div>

        {/* ── right card ── */}
        <motion.div
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, delay: 0.18, ease }}
          className="relative hidden overflow-hidden rounded-xl border bg-card/55 p-6 shadow-2xl backdrop-blur-sm lg:block"
        >
          <div className="absolute inset-0 bg-cyber-grid opacity-20" aria-hidden="true" />
          <div className="relative flex h-full min-h-[26rem] flex-col justify-between gap-6">

            <div className="flex items-center justify-between font-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">
              <span>creative systems</span>
              <span>2027</span>
            </div>

            <div className="grid gap-2">
              {sideItems.map(({ n, label }) => (
                <div key={label} className="grid grid-cols-[2rem_1fr] items-center gap-3">
                  <span className="font-mono text-[0.6rem] text-muted-foreground/50">{n}</span>
                  <div className="flex h-11 items-center border bg-background/55 px-4 font-[family-name:var(--font-display)] text-base uppercase tracking-[0.14em] transition-colors duration-200 hover:bg-background/80">
                    {label}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {["SEO", "i18n", "themes", "a11y"].map((tag) => (
                <div
                  key={tag}
                  className="rounded border bg-background/45 px-2 py-1.5 text-center font-mono text-[0.6rem] uppercase tracking-[0.16em] text-muted-foreground"
                >
                  {tag}
                </div>
              ))}
            </div>

            <p className="font-mono text-[0.68rem] leading-5 text-muted-foreground/60">
              Full-stack creative developer — software, games, and digital art built with precision.
            </p>

          </div>
        </motion.div>
      </div>

      {/* marquee strip */}
      <div className="relative border-t bg-background/30">
        <Marquee
          items={marqueeItems}
          speed="normal"
          className="py-3 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground/70"
        />
      </div>
    </section>
  )
}
