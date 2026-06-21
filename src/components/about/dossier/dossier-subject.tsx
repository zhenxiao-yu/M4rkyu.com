"use client";

import { ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { DecryptedText } from "@/components/ui/magic/decrypted-text";
import { Link } from "@/i18n/navigation";
import { Magnetic } from "../magnetic";

interface DossierSubjectProps {
  /** Eyebrow, e.g. "SUBJECT FILE". */
  eyebrow: string;
  /** Short file tag, e.g. "M4//YU". */
  fileTag: string;
  /** Display name — the page's single <h1>. */
  name: string;
  /** Role line under the name. */
  designation: string;
  /** Label for the base-of-operations arc. */
  baseLabel: string;
  /** "Changchun → … → Ontario" — the final stop resolves with a decrypt. */
  baseArc: string;
  statusLabel: string;
  statusAria: string;
  seeWork: string;
  sayHello: string;
}

/**
 * The dossier masthead: a glass band carrying the subject's name (decrypting
 * into place on view), designation, the origin → present arc, a live status
 * cluster, and the primary CTAs. The status halo and name scramble both fall
 * back to their resting state under reduced motion; the arc and CTAs work
 * with no motion at all.
 */
export function DossierSubject({
  eyebrow,
  fileTag,
  name,
  designation,
  baseLabel,
  baseArc,
  statusLabel,
  statusAria,
  seeWork,
  sayHello,
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
      {/* Top hairline + faint grid wash, both decorative. */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-ring/50 to-transparent"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cyber-grid opacity-[0.18] [mask-image:linear-gradient(to_bottom,black,transparent_72%)]"
      />

      <div className="relative grid gap-6 p-6 sm:p-8 lg:p-10">
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
            <span
              aria-hidden="true"
              className="relative grid size-2 place-items-center"
            >
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

        <h1 className="serif-morph max-w-3xl text-balance font-display text-[clamp(2.75rem,8vw,6rem)] font-semibold leading-[0.9] tracking-tight">
          <DecryptedText
            text={name}
            animateOn="view"
            sequential
            speed={34}
            encryptedClassName="text-ring/70"
          />
        </h1>

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

        <div className="flex flex-wrap gap-2 pt-1">
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

      {/* Tri-ink accent baseline signs the bottom edge. */}
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
