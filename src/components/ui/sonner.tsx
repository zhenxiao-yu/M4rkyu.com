"use client";

import { useTheme } from "@/components/theme/theme-provider";
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
      // The site provider resolves system before this reaches Sonner.
      theme={(resolvedTheme as ToasterProps["theme"]) ?? "system"}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "var(--popover)",
          "--success-text": "var(--popover-foreground)",
          "--success-border":
            "color-mix(in srgb, var(--success) 35%, var(--border))",
          "--error-bg": "var(--popover)",
          "--error-text": "var(--popover-foreground)",
          "--error-border":
            "color-mix(in srgb, var(--destructive) 40%, var(--border))",
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
      // Graceful vertical stacking: multiple toasts sit one above the
      // other with comfortable spacing instead of overlapping or
      // replacing each other. `expand` keeps the stack open so several
      // are readable at once; older ones past `visibleToasts` fold away.
      position="bottom-right"
      expand
      visibleToasts={4}
      gap={12}
      richColors
      closeButton
      {...props}
    />
  );
}
