import { z } from "zod";
import { ASPECT_ENUM, ITEM_TYPE_ENUM, STATUS_ENUM } from "./shared";

// Per-field validators for inline autosave. This object is the allowlist:
// only these keys are writable; the action drops everything else.
const FIELD_VALIDATORS = {
  title: z.string().min(1).max(160),
  caption: z.string().max(1000),
  alt: z.string().max(240),
  location: z.string().max(160),
  capturedAt: z.string().max(40),
  type: ITEM_TYPE_ENUM,
  aspect: ASPECT_ENUM,
  status: STATUS_ENUM,
  tags: z.array(z.string().max(40)).max(40),
  mood: z.array(z.string().max(40)).max(40),
  featured: z.boolean(),
  pinned: z.boolean(),
} as const;

const COLUMN: Record<keyof typeof FIELD_VALIDATORS, string> = {
  title: "title",
  caption: "caption",
  alt: "alt",
  location: "location",
  capturedAt: "captured_at",
  type: "type",
  aspect: "aspect",
  status: "status",
  tags: "tags",
  mood: "mood",
  featured: "featured",
  pinned: "pinned",
};

type FieldKey = keyof typeof FIELD_VALIDATORS;

export function buildGalleryItemPatch(
  input: Record<string, unknown>,
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  for (const key of Object.keys(FIELD_VALIDATORS) as FieldKey[]) {
    if (!(key in input)) continue;
    patch[COLUMN[key]] = FIELD_VALIDATORS[key].parse(input[key]);
  }
  return patch;
}
