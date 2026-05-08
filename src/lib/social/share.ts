// Share helpers. Falls back from native share → clipboard → no-op.
// The caller is responsible for surfacing user feedback (toast, inline label).

export type ShareResult = "shared" | "copied" | "unsupported";

export interface ShareInput {
  title: string;
  text?: string;
  url: string;
}

export async function shareOrCopy(input: ShareInput): Promise<ShareResult> {
  if (typeof window === "undefined") return "unsupported";

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share(input);
      return "shared";
    } catch {
      // User cancelled or share failed — fall through to clipboard.
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(input.url);
      return "copied";
    } catch {
      return "unsupported";
    }
  }

  return "unsupported";
}

export function buildFrameShareUrl(origin: string, locale: string, slug: string): string {
  const safeOrigin = origin.replace(/\/$/, "");
  return `${safeOrigin}/${locale}/gallery?frame=${encodeURIComponent(slug)}`;
}
