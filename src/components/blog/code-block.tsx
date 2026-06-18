"use client";

import {
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { cn, FOCUS_RING } from "@/lib/utils";
import { playCue } from "@/lib/audio/ui-sound";

interface CodeBlockProps {
  children: ReactNode;
  className?: string;
  preProps?: ComponentPropsWithoutRef<"pre">;
}

/**
 * Chrome wrapper around a Shiki-highlighted `<pre>` in post bodies: a
 * language badge (best-effort, read from Shiki's output) and a
 * copy-to-clipboard button that appears on hover/focus. The highlighted
 * tokens arrive as server-rendered `children`; this client island only adds
 * the controls, so the syntax colors are untouched.
 */
export function CodeBlock({ children, className, preProps }: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const resetTimerRef = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<string | null>(null);
  const t = useTranslations("Blog");

  useEffect(() => {
    return () => {
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const code = preRef.current?.querySelector("code");
    const classes = `${code?.className ?? ""} ${preRef.current?.className ?? ""}`;
    const fromClass = /language-([a-z0-9+#.-]+)/i.exec(classes)?.[1];
    const fromData =
      code?.getAttribute("data-language") ??
      preRef.current?.getAttribute("data-language") ??
      undefined;
    const found = (fromClass ?? fromData ?? "").toLowerCase();
    if (found && found !== "text" && found !== "plaintext") setLang(found);
  }, []);

  async function copy() {
    const text = preRef.current?.textContent ?? "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      playCue("confirm");
      toast.success(t("codeCopied"));
      if (resetTimerRef.current !== null) {
        window.clearTimeout(resetTimerRef.current);
      }
      resetTimerRef.current = window.setTimeout(() => {
        setCopied(false);
        resetTimerRef.current = null;
      }, 1600);
    } catch {
      // Clipboard blocked (insecure context / denied permission) — no-op.
    }
  }

  return (
    <div className="group relative mt-6">
      {lang ? (
        <span className="pointer-events-none absolute left-3 top-2.5 z-10 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground/70">
          {lang}
        </span>
      ) : null}
      <button
        type="button"
        onClick={copy}
        aria-label={t("codeCopyAria")}
        className={cn(
          "absolute right-2 top-2 z-10 inline-flex size-8 items-center justify-center rounded-md border border-border bg-background/70 text-muted-foreground opacity-0 backdrop-blur-sm transition-[opacity,color,border-color] duration-(--motion-fast) ease-(--ease-premium) hover:border-ring/60 hover:text-foreground focus-visible:opacity-100 group-hover:opacity-100",
          FOCUS_RING,
        )}
      >
        {copied ? (
          <Check aria-hidden="true" className="size-3.5 text-ring" />
        ) : (
          <Copy aria-hidden="true" className="size-3.5" />
        )}
      </button>
      <pre
        ref={preRef}
        {...preProps}
        className={cn(
          // pt-9 reserves room for the language badge + copy button so they
          // never sit on top of the first line of code.
          "max-w-full overflow-x-auto rounded-md border border-border bg-muted/50 p-4 pt-9 font-mono text-sm leading-6",
          className,
        )}
      >
        {children}
      </pre>
    </div>
  );
}
