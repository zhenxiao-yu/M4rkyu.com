"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

interface DeleteButtonProps extends Omit<ComponentProps<typeof Button>, "type"> {
  children: ReactNode;
  /** Browser confirm() prompt shown before the form submits. */
  confirmMessage: string;
}

// Submit button that intercepts the click, asks for confirmation,
// and then lets the surrounding <form> submit normally on accept.
// useFormStatus handles the pending state so a confirmed-then-clicked
// button still locks out double-submits.
export function DeleteButton({
  children,
  confirmMessage,
  disabled,
  className,
  onClick,
  ...rest
}: DeleteButtonProps) {
  return (
    <InnerDeleteButton
      {...rest}
      confirmMessage={confirmMessage}
      disabled={disabled}
      className={className}
      onClick={onClick}
    >
      {children}
    </InnerDeleteButton>
  );
}

function InnerDeleteButton({
  children,
  confirmMessage,
  disabled,
  className,
  onClick,
  ...rest
}: DeleteButtonProps) {
  const { pending } = useFormStatus();
  const [armed, setArmed] = useState(false);

  return (
    <Button
      {...rest}
      type="submit"
      disabled={pending || disabled}
      onClick={(event) => {
        if (pending) {
          event.preventDefault();
          return;
        }
        if (!armed) {
          const ok = window.confirm(confirmMessage);
          if (!ok) {
            event.preventDefault();
            return;
          }
          setArmed(true);
        }
        onClick?.(event);
      }}
      className={cn(className)}
    >
      {pending ? (
        <>
          <Loader2
            aria-hidden="true"
            className="size-4 animate-spin motion-reduce:animate-none"
          />
          {children}
        </>
      ) : (
        <>
          <Trash2 aria-hidden="true" className="size-3.5" />
          {children}
        </>
      )}
    </Button>
  );
}
