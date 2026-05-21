import type { NoteTier } from "@/content/schemas";

// Tier lists are authored in the admin as one tier per line:
//
//   S: Inter, Berkeley Mono
//   A: VT323, IBM Plex
//   Honorable mentions: Comic Sans (ironically)
//
// The label is everything before the first colon; the items are the
// comma-separated remainder. This keeps the editor a plain textarea
// instead of a bespoke drag-and-drop surface, and round-trips cleanly
// back into the same text for editing.

export function parseTiers(text: string): NoteTier[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const colon = line.indexOf(":");
      const label = (colon === -1 ? line : line.slice(0, colon)).trim();
      const rest = colon === -1 ? "" : line.slice(colon + 1);
      const items = rest
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      return { label, items };
    })
    .filter((tier) => tier.label.length > 0);
}

export function tiersToText(tiers: NoteTier[]): string {
  return tiers
    .map((tier) => `${tier.label}: ${tier.items.join(", ")}`)
    .join("\n");
}
