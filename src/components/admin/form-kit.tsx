"use client";

import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { useFieldError } from "./form-errors";
import { cn } from "@/lib/utils";

// Shared presentational form primitives for every admin editor. Client
// components so each input can pull its per-field error from the
// AdminForm errors context by `name`; still rendered from the server
// form bodies (the normal RSC pattern). SlugField lives in its own module.

export const adminInputClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="grid gap-3 rounded-lg border border-border/60 bg-card/60 p-5">
      <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.22em] text-muted-foreground">
        {title}
      </h2>
      <div className="grid gap-3">{children}</div>
    </section>
  );
}

export function Row({ cols, children }: { cols: 2 | 3; children: ReactNode }) {
  // 3-col rows wait until md so labels + textareas don't crush at 360px;
  // 2-col rows kick in at sm, roomy enough for two short fields.
  // `items-start` top-aligns the cells: without it, a field with a hint
  // (e.g. the slug) makes the grid stretch its hint-less neighbour (the
  // title), pushing that input out of line with the slug's input.
  return (
    <div
      className={
        cols === 2
          ? "grid items-start gap-3 sm:grid-cols-2"
          : "grid items-start gap-3 md:grid-cols-3"
      }
    >
      {children}
    </div>
  );
}

function FieldLabel({ label }: { label: string }) {
  return (
    <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
      {label}
    </span>
  );
}

function FieldHint({ hint, error }: { hint?: string; error?: string }) {
  if (error) {
    return <span className="text-[0.7rem] text-destructive">{error}</span>;
  }
  if (hint) {
    return <span className="text-[0.7rem] text-muted-foreground/70">{hint}</span>;
  }
  return null;
}

export function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  multiline,
  rows,
  hint,
  pattern,
  error,
  assist,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  hint?: string;
  pattern?: string;
  error?: string;
  /** Optional trailing control on the label row (e.g. an AI ✨ button). */
  assist?: ReactNode;
}) {
  const resolved = useFieldError(name) ?? error;
  const invalid = Boolean(resolved);
  const errorText = resolved?.trim() ? resolved : undefined;
  return (
    <label className="grid gap-1.5 text-sm">
      {assist ? (
        <span className="flex items-center justify-between gap-2">
          <FieldLabel label={label} />
          {assist}
        </span>
      ) : (
        <FieldLabel label={label} />
      )}
      {multiline ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          rows={rows ?? 4}
          required={required}
          aria-invalid={invalid ? true : undefined}
          className={cn(adminInputClass, invalid && "border-destructive")}
        />
      ) : (
        <Input
          name={name}
          type={type}
          defaultValue={defaultValue}
          required={required}
          pattern={pattern}
          aria-invalid={invalid ? true : undefined}
          autoComplete="off"
        />
      )}
      <FieldHint hint={hint} error={errorText} />
    </label>
  );
}

export function Select({
  label,
  name,
  options,
  defaultValue,
  error,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
  error?: string;
}) {
  const resolved = useFieldError(name) ?? error;
  const invalid = Boolean(resolved);
  return (
    <label className="grid gap-1.5 text-sm">
      <FieldLabel label={label} />
      <select
        name={name}
        defaultValue={defaultValue}
        aria-invalid={invalid ? true : undefined}
        className={cn(adminInputClass, invalid && "border-destructive")}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <FieldHint error={resolved?.trim() ? resolved : undefined} />
    </label>
  );
}

export function FileField({
  label,
  name,
  accept,
  hint,
  required,
  error,
}: {
  label: string;
  name: string;
  accept?: string;
  hint?: string;
  required?: boolean;
  error?: string;
}) {
  const resolved = useFieldError(name) ?? error;
  const invalid = Boolean(resolved);
  return (
    <label className="grid gap-1.5 text-sm">
      <FieldLabel label={label} />
      <input
        type="file"
        name={name}
        accept={accept}
        required={required}
        aria-invalid={invalid ? true : undefined}
        className={cn(
          adminInputClass,
          invalid && "border-destructive",
          "file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-xs file:font-medium file:text-foreground hover:file:bg-muted/70",
        )}
      />
      <FieldHint hint={hint} error={resolved?.trim() ? resolved : undefined} />
    </label>
  );
}

export function Checkbox({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 rounded border-border accent-ring"
      />
      <span>{label}</span>
    </label>
  );
}
