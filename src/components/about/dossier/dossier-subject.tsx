"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { BlurImage } from "@/components/ui/blur-image";
import { DecryptedText } from "@/components/ui/magic/decrypted-text";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Magnetic } from "../magnetic";
import { IdentityName } from "./identity-name";

interface Portrait {
  src: string;
  alt: string;
  focal?: "top" | "center" | "bottom";
}

interface DossierSubjectProps {
  eyebrow: string;
  fileTag: string;
  /** Chinese name — types out first, then holds beneath the primary. */
  nameZh: string;
  /** English wordmark — the primary name. */
  namePrimary: string;
  designation: string;
  baseLabel: string;
  baseArc: string;
  statusLabel: string;
  statusAria: string;
  seeWork: string;
  sayHello: string;
  /** Optional portrait; an artsy monogram frame stands in until it's set. */
  portrait?: Portrait | null;
}

const FOCAL: Record<NonNullable<Portrait["focal"]>, string> = {
  top: "center top",
  center: "center",
  bottom: "center bottom",
};

/**
 * The dossier masthead — a compact identity card. A framed portrait (or an
 * artsy 于 monogram until a photo is added) sits beside the bilingual name
 * reveal (于震潇 types in, then "Mark Yu" resolves as the primary), the
 * designation, the origin → present arc, a live status, and the CTAs. The
 * status halo + arc decrypt fall back to rest under reduced motion.
 */
export function DossierSubject({
  eyebrow,
  fileTag,
  nameZh,
  namePrimary,
  designation,
  baseLabel,
  baseArc,
  statusLabel,
  statusAria,
  seeWork,
  sayHello,
  portrait,
}: DossierSubjectProps) {
  const reduced = useReducedMotion();
  const segments = baseArc
    .split("→")
    .map((segment) => segment.trim())
    .filter(Boolean);
  const head = segments.slice(0, -1);
  const last = segments[segments.length - 1] ?? baseArc;

  return (
    <div className="glass-surface glass-interactive relative isolate overflow-hidden rounded-lg">
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-ring/50 to-transparent"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cyber-grid opacity-[0.18] [mask-image:linear-gradient(to_bottom,black,transparent_72%)]"
      />

      <div className="relative grid gap-7 p-6 sm:p-8 lg:grid-cols-[clamp(9rem,15vw,12.5rem)_1fr] lg:items-stretch lg:gap-10 lg:p-10">
        {/* Portrait — framed, monochrome, subtle. The artsy 于 monogram stands
            in until profile.portrait is set. */}
        <PortraitSlot portrait={portrait} fileTag={fileTag} reduced={reduced} />

        {/* Identity column */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-pixel text-base uppercase leading-none tracking-[0.1em] sm:text-lg">
              <span className="text-foreground/70">{eyebrow}</span>
              <span aria-hidden="true" className="px-1.5 text-ring">
                ·
              </span>
              <span className="text-foreground/55">{fileTag}</span>
            </p>

            <span
              role="status"
              aria-label={statusAria}
              className="inline-flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.16em]"
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
              <span className="text-foreground/70">{statusLabel}</span>
            </span>
          </div>

          <IdentityName
            nameZh={nameZh}
            namePrimary={namePrimary}
            className="max-w-2xl"
          />

          <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
            <span aria-hidden="true" className="inline-block h-px w-6 bg-ring/60" />
            {designation}
          </p>

          <p className="flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-xs text-muted-foreground sm:text-sm">
            <span className="uppercase tracking-[0.18em] text-hud-muted">
              {baseLabel}
            </span>
            <span className="text-foreground/85">
              {head.map((segment) => (
                <span key={segment}>
                  {segment}
                  <span aria-hidden="true" className="px-1.5 text-ring">
                    →
                  </span>
                </span>
              ))}
              <DecryptedText
                text={last}
                animateOn="view"
                sequential
                speed={42}
                encryptedClassName="text-ring/70"
              />
            </span>
          </p>

          <div className="mt-auto flex flex-wrap gap-2 pt-1">
            <Magnetic>
              <Button asChild>
                <Link href="/work">
                  {seeWork}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </Magnetic>
            <Magnetic>
              <Button asChild variant="outline">
                <Link href="/contact">{sayHello}</Link>
              </Button>
            </Magnetic>
          </div>
        </div>
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[2px]"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in srgb, var(--ring) 65%, transparent) 20%, color-mix(in srgb, var(--ring-3) 70%, transparent) 50%, color-mix(in srgb, var(--ring-2) 65%, transparent) 80%, transparent)",
        }}
      />
    </div>
  );
}

function PortraitSlot({
  portrait,
  fileTag,
  reduced,
}: {
  portrait?: Portrait | null;
  fileTag: string;
  reduced: boolean | null;
}) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
      className="relative mx-auto aspect-4/5 w-[clamp(8.5rem,42vw,12.5rem)] shrink-0 self-start overflow-hidden rounded-md border border-border/70 bg-card lg:mx-0 lg:w-full"
    >
      {portrait ? (
        <BlurImage
          src={portrait.src}
          alt={portrait.alt}
          fill
          sizes="13rem"
          className="object-cover [@media(pointer:fine)]:grayscale transition duration-500 ease-(--ease-premium) [@media(pointer:fine)]:hover:grayscale-0"
          style={{ objectPosition: FOCAL[portrait.focal ?? "center"] }}
        />
      ) : (
        <>
          {/* Artsy stand-in — the surname 于 as a quiet typographic portrait,
              de-digitised with grain. Swaps to the real photo the moment
              profile.portrait is set. */}
          <div className="absolute inset-0 grid place-items-center">
            <span
              aria-hidden="true"
              className="font-display text-[7rem] font-bold leading-none text-foreground/[0.08]"
            >
              于
            </span>
          </div>
          <div aria-hidden="true" className="noise-layer pointer-events-none absolute inset-0 opacity-40" />
        </>
      )}

      {/* Registration ticks + a quiet file caption. */}
      <span aria-hidden="true" className="absolute left-2 top-2 size-2.5 border-l border-t border-foreground/30" />
      <span aria-hidden="true" className="absolute bottom-2 right-2 size-2.5 border-b border-r border-foreground/30" />
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 bottom-0 flex items-center justify-between px-2.5 py-1.5",
          "bg-linear-to-t from-background/85 to-transparent font-mono text-[0.5rem] uppercase tracking-[0.2em] text-muted-foreground/75",
        )}
      >
        <span>{fileTag}</span>
        <span>4:5</span>
      </span>
    </motion.div>
  );
}
