"use client";

import { ArrowUpRight } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { Button } from "@/components/ui/button";
import { ShinyText } from "@/components/ui/magic/shiny-text";
import { Link } from "@/i18n/navigation";
import { Magnetic } from "../magnetic";

interface DossierSignoffProps {
  /** Closing statement (rendered large, with a slow ShinyText sweep). */
  title: string;
  body: string;
  /** The `whoami` payload printed under the terminal prompt. */
  whoami: string;
  seeWork: string;
  sayHello: string;
}

/**
 * The end of the file: a closing statement, a quiet `$ whoami` terminal beat
 * with a blinking caret (held still under reduced motion), the parting CTAs,
 * and a faint M4 overprint filling the corner. The title is a styled
 * statement, not a heading — the panel's "SIGN-OFF" label owns the h2.
 */
export function DossierSignoff({
  title,
  body,
  whoami,
  seeWork,
  sayHello,
}: DossierSignoffProps) {
  const reduced = useReducedMotion();

  return (
    <div className="relative overflow-hidden">
      {/* Quiet brand watermark filling the void behind the sign-off. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-10 -right-3 select-none font-display text-[10rem] font-semibold leading-none text-foreground/5 sm:text-[13rem]"
      >
        M4
      </span>

      <div className="relative grid gap-5">
        <p className="max-w-xl text-balance font-display text-3xl font-semibold leading-tight sm:text-4xl">
          <ShinyText duration={5}>{title}</ShinyText>
        </p>
        <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          {body}
        </p>

        <div aria-hidden="true" className="grid gap-1.5 font-mono text-xs">
          <span className="h-px w-2/3 bg-linear-to-r from-border via-border/40 to-transparent" />
          <p className="text-muted-foreground/80">
            <span className="text-ring">$</span> whoami
          </p>
          <p className="flex items-center gap-1.5 text-muted-foreground/70">
            <span>{whoami}</span>
            <span
              className="inline-block h-3.5 w-[0.55ch] bg-foreground/45"
              style={reduced ? undefined : { animation: "workspace-caret 1.1s infinite" }}
            />
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Magnetic>
            <Button asChild>
              <Link href="/contact">
                {sayHello}
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </Magnetic>
          <Magnetic>
            <Button asChild variant="outline">
              <Link href="/work">{seeWork}</Link>
            </Button>
          </Magnetic>
        </div>
      </div>
    </div>
  );
}
