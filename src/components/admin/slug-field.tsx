"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { adminInputClass } from "./form-kit";

export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// Slug input that auto-fills from a sibling field (the title/name) until
// the user types in it directly. On an existing record (defaultValue set)
// it starts "locked" so we never silently rewrite a published slug.
// Reads the source field through the shared <form> rather than prop
// drilling, so it drops into any form unchanged.
export function SlugField({
  name,
  sourceName,
  label,
  hint,
  defaultValue,
  error,
}: {
  name: string;
  sourceName: string;
  label: string;
  hint?: string;
  defaultValue?: string;
  error?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const touchedRef = useRef<boolean>(Boolean(defaultValue));

  useEffect(() => {
    const input = ref.current;
    const form = input?.form;
    if (!input || !form) return;
    const source = form.elements.namedItem(sourceName);
    if (!(source instanceof HTMLInputElement)) return;

    const handle = () => {
      if (touchedRef.current) return;
      input.value = slugify(source.value);
    };
    source.addEventListener("input", handle);
    return () => source.removeEventListener("input", handle);
  }, [sourceName]);

  return (
    <label className="grid gap-1.5 text-sm">
      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </span>
      <Input
        ref={ref}
        name={name}
        defaultValue={defaultValue}
        pattern="[a-z0-9-]+"
        required
        autoComplete="off"
        aria-invalid={error ? true : undefined}
        onChange={() => {
          touchedRef.current = true;
        }}
      />
      {error ? (
        <span className="text-[0.7rem] text-destructive">{error}</span>
      ) : hint ? (
        <span className="text-[0.7rem] text-muted-foreground/70">{hint}</span>
      ) : null}
    </label>
  );
}

// Re-export so forms can pull the shared class from one place.
export { adminInputClass };
