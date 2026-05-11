"use client";

import { useTheme } from "next-themes";
import { Toaster as SonnerToaster, type ToasterProps } from "sonner";

/**
 * Sonner toaster, themed against our CSS variables so it tracks the
 * site palette (light, dark, future variants) without any explicit
 * mode switching. Mounted once in the root layout — call `toast()`
 * from anywhere in the app.
 */
export function Toaster({ ...props }: ToasterProps) {
  const { resolvedTheme } = useTheme();

  return (
    <SonnerToaster
      // `next-themes` may surface "system" before hydration; coerce to
      // a valid Sonner theme to avoid a TS narrowing dance.
      theme={(resolvedTheme as ToasterProps["theme"]) ?? "system"}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--popover)",
          "--success-text": "var(--popover-foreground)",
          "--success-border": "color-mix(in srgb, var(--success) 35%, var(--border))",
          "--error-bg": "var(--popover)",
          "--error-text": "var(--popover-foreground)",
          "--error-border": "color-mix(in srgb, var(--destructive) 40%, var(--border))",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      richColors
      closeButton
      {...props}
    />
  );
}
