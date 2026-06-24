"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useFieldError } from "./form-errors";
import { cn } from "@/lib/utils";

/**
 * Chip/tag editor — a drop-in for the admin's manual one-per-line array
 * `<textarea>`s (platforms, tech stack, tags, pillars, notes). Renders the
 * values as removable chips with an inline add field; mirrors the chip set
 * into a hidden input named `name`, **newline-joined**, which is exactly the
 * format the server actions already split on — so the backend is untouched.
 *
 * Add on Enter or comma (and on blur); Backspace on an empty input removes the
 * last chip. Pulls its per-field error from the AdminForm errors context like
 * the rest of form-kit. (SlugField + TagField each live in their own module.)
 */

function splitValue(value?: string): string[] {
  if (!value) return [];
  return value
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function TagField({
  label,
  name,
  defaultValue,
  hint,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  /** Newline-joined string (the same shape the textarea used). */
  defaultValue?: string;
  hint?: string;
  placeholder?: string;
  error?: string;
}) {
  const t = useTranslations("Common");
  const [tags, setTags] = useState<string[]>(() => splitValue(defaultValue));
  const [draft, setDraft] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const resolved = useFieldError(name) ?? error;
  const invalid = Boolean(resolved);

  function addTag(raw: string) {
    const value = raw.trim();
    if (!value) return;
    setTags((cur) => (cur.includes(value) ? cur : [...cur, value]));
    setDraft("");
  }

  function removeTag(index: number) {
    setTags((cur) => cur.filter((_, i) => i !== index));
    inputRef.current?.focus();
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
    } else if (event.key === "Backspace" && draft === "" && tags.length > 0) {
      event.preventDefault();
      removeTag(tags.length - 1);
    }
  }

  return (
    <div className="grid gap-1.5 text-sm">
      <label
        htmlFor={inputId}
        className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground"
      >
        {label}
      </label>
      {/* The submitted value — newline-joined so the existing actions parse it
        * unchanged. */}
      <input type="hidden" name={name} value={tags.join("\n")} readOnly />
      <div
        className={cn(
          "flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border bg-background px-2 py-1.5 shadow-sm focus-within:ring-2 focus-within:ring-ring",
          invalid ? "border-destructive" : "border-border",
        )}
      >
        {tags.map((tag, index) => (
          <span
            key={`${tag}-${index}`}
            className="inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-xs text-foreground"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(index)}
              aria-label={t("removeItem", { item: tag })}
              className="grid size-3.5 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            >
              <X aria-hidden="true" className="size-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          id={inputId}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => addTag(draft)}
          placeholder={tags.length === 0 ? placeholder : undefined}
          aria-invalid={invalid ? true : undefined}
          autoComplete="off"
          className="min-w-24 flex-1 border-0 bg-transparent px-1 py-0.5 text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </div>
      {resolved?.trim() ? (
        <span className="text-[0.7rem] text-destructive">{resolved}</span>
      ) : hint ? (
        <span className="text-[0.7rem] text-muted-foreground/70">{hint}</span>
      ) : null}
    </div>
  );
}
