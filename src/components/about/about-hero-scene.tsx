"use client";

import dynamic from "next/dynamic";
import { ArrowUpRight, ChevronDown, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { BlurFade } from "@/components/ui/magic/blur-fade";
import { BorderBeam } from "@/components/ui/magic/border-beam";
import { DecryptedText } from "@/components/ui/magic/decrypted-text";
import { PointerSpotlight } from "@/components/ui/magic/pointer-spotlight";
import { RotatingText } from "@/components/ui/magic/rotating-text";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { IdentityName } from "./dossier/identity-name";
import { Magnetic } from "./magnetic";
import { PortraitOrbit } from "./portrait-orbit";

interface Portrait {
  src: string;
  alt: string;
  caption?: string;
  focal: "top" | "center" | "bottom";
}

// WebGL starfield — heavy (OGL). SSR off so the canvas only mounts client-side;
// Galaxy renders a single static frame under reduced motion on its own.
const Galaxy = dynamic(
  () =>
    import("@/components/ui/magic/galaxy").then((m) => ({ default: m.Galaxy })),
  { ssr: false },
);

/**
 * Scene 1 — the cinematic hero. A full-viewport "subject console": a WebGL
 * starfield + drifting aurora behind a glass panel ringed by a BorderBeam, the
 * rotating circular portrait on one side and the 于震潇 → Mark Yu reveal on the
 * other (full-stack engineer lead + rotating craft facets). Scroll hands off to
 * the living bento below. Every motion layer is reduced-motion + touch safe.
 */
export function AboutHeroScene({
  portraits,
  location,
}: {
  portraits: Portrait[];
  location: string;
}) {
  const t = useTranslations("About");
  const reduced = useReducedMotion();
  const roles = (t.raw("refined.heroRoles") as string[] | undefined) ?? [];

  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden px-4 py-24 sm:px-6 lg:px-8">
      {/* Atmosphere — masked starfield + two drifting aurora glows. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 opacity-70 mask-[radial-gradient(125%_120%_at_50%_0%,#000_30%,transparent_72%)]">
          <Galaxy
            density={0.6}
            hueShift={190}
            saturation={0.5}
            glowIntensity={0.22}
            starSpeed={0.22}
            speed={0.6}
            twinkleIntensity={0.4}
            rotationSpeed={0.06}
            mouseInteraction={false}
            mouseRepulsion={false}
            transparent
          />
        </div>
        <motion.div
          className="absolute -left-24 -top-28 size-[30rem] rounded-full opacity-50 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--ring) 20%, transparent), transparent 70%)",
          }}
          animate={reduced ? undefined : { x: [0, 40, -10, 0], y: [0, 24, -16, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 -right-24 size-[26rem] rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--ring-2) 16%, transparent), transparent 70%)",
          }}
          animate={reduced ? undefined : { x: [0, -32, 12, 0], y: [0, -20, 18, 0] }}
          transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto w-full max-w-page">
        <div className="glass-surface glass-interactive relative isolate overflow-hidden rounded-lg p-6 sm:p-8 lg:p-12">
          <BorderBeam duration={14} borderRadius={8} />
          <PointerSpotlight radius={560} intensity={0.16} />
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-ring/50 to-transparent"
          />

          <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_clamp(15rem,28vw,21rem)] lg:gap-12">
            {/* Identity column */}
            <div className="order-2 flex flex-col gap-5 lg:order-1">
              <BlurFade delay={0}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="inline-flex items-center font-pixel text-base uppercase leading-none tracking-[0.1em] sm:text-lg">
                    <span className="text-foreground/70">
                      {t("dossier.subjectEyebrow")}
                    </span>
                    <span aria-hidden="true" className="px-1.5 text-ring">
                      ·
                    </span>
                    <span className="text-foreground/55">
                      {t("dossier.fileTag")}
                    </span>
                  </p>
                  <HeroStatus
                    label={t("dossier.statusLabel")}
                    aria={t("dossier.statusAria")}
                    reduced={reduced}
                  />
                </div>
              </BlurFade>

              <BlurFade delay={0.1}>
                <p className="inline-flex items-center gap-2 font-mono text-[0.7rem] uppercase tracking-[0.22em] text-muted-foreground">
                  <MapPin className="size-3" aria-hidden="true" />
                  <DecryptedText
                    text={location}
                    animateOn="view"
                    sequential
                    speed={38}
                    encryptedClassName="text-ring/70"
                  />
                </p>
              </BlurFade>

              <IdentityName
                nameZh={t("dossier.nameZh")}
                namePrimary={t("dossier.namePrimary")}
              />

              <BlurFade delay={0.5}>
                <div className="space-y-1.5">
                  <p className="font-mono text-xs uppercase tracking-[0.18em] text-foreground/85 sm:text-sm">
                    {t("bento.role")}
                  </p>
                  <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
                    <span aria-hidden="true" className="inline-block h-px w-6 bg-ring/60" />
                    {roles.length > 0 ? (
                      <RotatingText words={roles} intervalMs={2200} />
                    ) : (
                      t("bento.focus")
                    )}
                  </p>
                </div>
              </BlurFade>

              <BlurFade delay={0.6}>
                <p className="max-w-xl text-balance text-sm leading-7 text-muted-foreground sm:text-base">
                  {t("refined.heroBody")}
                </p>
              </BlurFade>

              <BlurFade delay={0.7}>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Magnetic>
                    <Button asChild>
                      <Link href="/work">
                        {t("dossier.seeWork")}
                        <ArrowUpRight className="size-4" aria-hidden="true" />
                      </Link>
                    </Button>
                  </Magnetic>
                  <Magnetic>
                    <Button asChild variant="outline">
                      <Link href="/contact">{t("dossier.sayHello")}</Link>
                    </Button>
                  </Magnetic>
                </div>
              </BlurFade>
            </div>

            {/* Portrait column */}
            <BlurFade delay={0.2} className="order-1 lg:order-2">
              <PortraitOrbit
                portraits={portraits}
                rotateLabel={t.raw("hero.portraitLabel") as string}
              />
            </BlurFade>
          </div>
        </div>
      </div>

      {/* Scroll cue — pinned to the viewport base, hands the eye to the bento. */}
      <motion.span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-6 mx-auto flex w-max flex-col items-center gap-1 font-mono text-[0.55rem] uppercase tracking-[0.3em] text-muted-foreground"
        animate={reduced ? undefined : { y: [0, 5, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      >
        {t("hero.scroll")}
        <ChevronDown className="size-3.5 text-ring" />
      </motion.span>
    </section>
  );
}

function HeroStatus({
  label,
  aria,
  reduced,
}: {
  label: string;
  aria: string;
  reduced: boolean | null;
}) {
  return (
    <span
      role="status"
      aria-label={aria}
      className="inline-flex items-center gap-2 font-mono text-[0.6rem] uppercase tracking-[0.14em]"
    >
      <span aria-hidden="true" className="relative grid size-2 place-items-center">
        <span className="size-2 rounded-full bg-success shadow-[0_0_6px_var(--terminal-glow)]" />
        {!reduced ? (
          <motion.span
            className="absolute inset-0 rounded-full bg-success"
            initial={{ opacity: 0.6, scale: 1 }}
            animate={{ opacity: 0, scale: 2.6 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
        ) : null}
      </span>
      <span className="text-foreground/70">{label}</span>
    </span>
  );
}
