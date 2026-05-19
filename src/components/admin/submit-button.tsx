"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

interface SubmitButtonProps extends Omit<ComponentProps<typeof Button>, "type"> {
  children: ReactNode;
  /** Optional override for the busy label. Defaults to "Saving…". */
  pendingLabel?: ReactNode;
}

// useFormStatus has to live inside a client component nested INSIDE
// the <form>; the surrounding admin pages stay server components.
// Disabling on `pending` blocks double-submits; the spinner gives
// the user a beat of feedback before the redirect lands.
export function SubmitButton({
  children,
  pendingLabel,
  disabled,
  className,
  ...rest
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button
      {...rest}
      type="submit"
      disabled={pending || disabled}
      className={cn(className)}
    >
      {pending ? (
        <>
          <Loader2
            aria-hidden="true"
            className="size-4 animate-spin motion-reduce:animate-none"
          />
          {pendingLabel ?? children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
