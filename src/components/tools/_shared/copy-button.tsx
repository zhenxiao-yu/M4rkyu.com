"use client";

import type { ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCopy } from "./use-copy";

interface CopyButtonProps
  extends Omit<ButtonProps, "onClick" | "children" | "value"> {
  /** Text written to the clipboard. */
  value: string;
  /** Optional noun woven into the toast + aria-label (e.g. "hex", "JSON"). */
  label?: string;
  /** Optional visible caption; omit for a square icon-only button. */
  children?: ReactNode;
}

/**
 * The one copy button for every tool. Flips Copy → Check on success,
 * surfaces a localized toast, and guards a missing clipboard API (via
 * `useCopy`). Icon-only by default with a translated aria-label; pass
 * children for a captioned variant.
 */
export function CopyButton({
  value,
  label,
  children,
  variant = "outline",
  size = "sm",
  className,
  disabled,
  ...rest
}: CopyButtonProps) {
  const t = useTranslations("Tools.common");
  const { copied, copy } = useCopy();
  const Icon = copied ? Check : Copy;
  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      onClick={() => void copy(value, label)}
      aria-label={
        children ? undefined : label ? t("copyLabel", { label }) : t("copy")
      }
      disabled={disabled}
      className={cn(
        !children && "w-9 px-0",
        copied && "text-success hover:text-success",
        className,
      )}
      {...rest}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {children}
    </Button>
  );
}
