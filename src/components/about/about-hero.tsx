"use client";

import { ArrowUpRight, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { BlurFade } from "@/components/ui/magic/blur-fade";
import { BorderBeam } from "@/components/ui/magic/border-beam";
import { DecryptedText } from "@/components/ui/magic/decrypted-text";
import { Galaxy } from "@/components/ui/magic/galaxy";
import { RotatingText } from "@/components/ui/magic/rotating-text";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { KineticHeading } from "./kinetic-heading";
import { Magnetic } from "./magnetic";

interface AboutHeroProps {
  locale: Locale;
  location: string;
  title: string;
  body: string;
  roles: string[];
  seeWork: string;
  sayHello: string;
}

export function AboutHero({
  locale,
  location,
  title,
  body,
  roles,
  seeWork,
  sayHello,
}: AboutHeroProps) {
  const reduced = useReducedMotion();

  return (
    <Card className="relative h-full overflow-hidden bg-card/85">
      {/* Single page highlight — quiet light trace around the hero. */}
      <BorderBeam duration={14} borderRadius={8} />

      {/* Maximalist signature — a WebGL starfield, masked so it stays
          dense at the top edge and dissolves behind the copy. Honors
          reduced-motion (renders a single static frame). */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-70 mask-[radial-gradient(125%_120%_at_50%_0%,#000_28%,transparent_72%)]"
      >
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

      {/* Fluid aurora field — two slow drifting glows, static when reduced. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <motion.div
          className="absolute -left-24 -top-28 size-[28rem] rounded-full opacity-[0.5] blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--ring) 22%, transparent), transparent 70%)",
          }}
          animate={
            reduced ? undefined : { x: [0, 40, -10, 0], y: [0, 24, -16, 0] }
          }
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 right-[-6rem] size-[24rem] rounded-full opacity-[0.4] blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--ring) 16%, transparent), transparent 70%)",
          }}
          animate={
            reduced ? undefined : { x: [0, -32, 12, 0], y: [0, -20, 18, 0] }
          }
          transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-ring/50 to-transparent"
      />

      <CardContent className="relative flex min-h-[22rem] flex-col justify-between gap-10 p-6 sm:p-8 lg:p-10">
        <div className="grid gap-6">
          <BlurFade delay={0}>
            <p className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
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

          <div className="grid gap-5">
            <KineticHeading
              text={title}
              delay={0.12}
              className="serif-morph max-w-4xl text-balance font-display text-[clamp(3.25rem,9vw,10rem)] font-semibold leading-[0.88] tracking-normal"
            />

            {roles.length > 0 ? (
              <BlurFade delay={0.5}>
                <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
                  <span
                    aria-hidden="true"
                    className="inline-block h-px w-6 bg-ring/60"
                  />
                  <span className="text-foreground/70">
                    <RotatingText words={roles} intervalMs={2200} />
                  </span>
                </p>
              </BlurFade>
            ) : null}

            <BlurFade delay={0.6}>
              <p className="max-w-xl text-balance text-base leading-8 text-muted-foreground sm:text-lg">
                {body}
              </p>
            </BlurFade>
          </div>
        </div>

        <BlurFade delay={0.7}>
          <div className="flex flex-wrap gap-2">
            <Magnetic>
              <Button asChild>
                <Link href="/work" locale={locale}>
                  {seeWork}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button asChild variant="outline">
                <Link href="/contact" locale={locale}>
                  {sayHello}
                </Link>
              </Button>
            </Magnetic>
          </div>
        </BlurFade>
      </CardContent>
    </Card>
  );
}
