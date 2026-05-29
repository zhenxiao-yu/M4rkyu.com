"use client";

import * as React from "react";
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Reusable `<FormField>` primitive built on `react-hook-form`'s
 * Controller. Renders a labelled input (or textarea / custom child)
 * with localised error display and the project's existing focus +
 * border treatment.
 *
 * Designed for any future form (newsletter signup, comment box,
 * project inquiry variants) to inherit the same a11y + theming
 * contract without re-wiring `aria-invalid` + `aria-describedby` by
 * hand on every input.
 *
 * Field naming, validation and error mapping all live in the form's
 * Zod schema; this component only does presentation.
 */

type RenderProps = {
  id: string;
  name: string;
  value: unknown;
  onChange: (event: unknown) => void;
  onBlur: () => void;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
};

interface FormFieldProps<TValues extends FieldValues> {
  control: Control<TValues>;
  name: FieldPath<TValues>;
  label: React.ReactNode;
  /**
   * Optional description rendered between label and input. Helpful for
   * forms with extra context (e.g. "We never share your email").
   */
  description?: React.ReactNode;
  /** Localised error message — schema validation maps a key → t(...). */
  errorMessage?: string;
  /**
   * When true, render a subtle success tick beside the label — the field
   * is touched/dirty and currently passes validation. Purely decorative.
   */
  valid?: boolean;
  /**
   * Custom renderer for non-text inputs (textarea, select, custom
   * widgets). When omitted, an `<Input>` is rendered with the spread
   * props from `inputProps`.
   */
  render?: (props: RenderProps) => React.ReactNode;
  /** Props for the default `<Input>` renderer. Ignored if `render` is provided. */
  inputProps?: Omit<
    React.ComponentProps<"input">,
    "id" | "name" | "value" | "onChange" | "onBlur" | "aria-invalid" | "aria-describedby"
  >;
  /** Wrapper class on the outer `<label>` (gap, spacing, etc.). */
  className?: string;
}

export function FormField<TValues extends FieldValues>({
  control,
  name,
  label,
  description,
  errorMessage,
  valid,
  render,
  inputProps,
  className,
}: FormFieldProps<TValues>) {
  const id = React.useId();
  const errorId = `${id}-error`;
  const descriptionId = description ? `${id}-desc` : undefined;
  const hasError = Boolean(errorMessage);
  const describedBy =
    [hasError ? errorId : undefined, descriptionId]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const rendered = render
          ? render({
              id,
              name: field.name,
              value: field.value,
              onChange: field.onChange,
              onBlur: field.onBlur,
              "aria-invalid": hasError,
              "aria-describedby": describedBy,
            })
          : (
              <Input
                {...inputProps}
                id={id}
                name={field.name}
                value={
                  typeof field.value === "string"
                    ? field.value
                    : field.value == null
                      ? ""
                      : String(field.value)
                }
                onChange={field.onChange}
                onBlur={field.onBlur}
                aria-invalid={hasError}
                aria-describedby={describedBy}
              />
            );

        return (
          <label htmlFor={id} className={cn("grid gap-2 text-sm font-medium", className)}>
            <span className="flex items-center gap-1.5">
              {label}
              {valid && !hasError ? (
                <Check
                  className="size-3.5 text-success motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-75 motion-safe:duration-(--motion-fast)"
                  aria-hidden="true"
                />
              ) : null}
            </span>
            {description ? (
              <span id={descriptionId} className="text-xs leading-5 text-muted-foreground">
                {description}
              </span>
            ) : null}
            {rendered}
            {hasError ? (
              <span
                id={errorId}
                className="text-xs text-destructive"
                aria-live="polite"
              >
                {errorMessage}
              </span>
            ) : null}
          </label>
        );
      }}
    />
  );
}
