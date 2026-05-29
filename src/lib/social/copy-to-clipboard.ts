// Tiny clipboard helper that writes text and surfaces a Sonner toast.
// Mirrors the copy + feedback pattern in qr-code-button.tsx so callers
// stay one-liners. Pass localised toast strings from the "Social"
// namespace (e.g. `linkCopied` / `sharingUnavailable`).

import { toast } from "sonner";

export interface CopyToClipboardMessages {
  /** Toast on a successful write. */
  success: string;
  /** Toast when the clipboard API is missing or the write throws. */
  error: string;
}

export async function copyToClipboard(
  text: string,
  messages: CopyToClipboardMessages,
): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    toast.error(messages.error);
    return false;
  }
  try {
    await navigator.clipboard.writeText(text);
    toast.success(messages.success);
    return true;
  } catch {
    toast.error(messages.error);
    return false;
  }
}
