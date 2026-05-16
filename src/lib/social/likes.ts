// Phase 1: visitor-local likes. The visitor's own toggle state is the only
// real state that exists today. Public counts are not surfaced because no
// backend is wired yet (see docs/GALLERY_SOCIAL_SPEC.md §13).
//
// This module is the single boundary between UI code and storage. When a
// backend lands, swap the body of the four exported functions and leave the
// signatures intact.

import {
  dispatchStoredValueChanged,
  readStoredJson,
  subscribeStoredValue,
  writeStoredJson,
} from "@/lib/browser/safe-storage";

const STORAGE_KEY = "m4_liked_frames";
const CHANGE_EVENT = "m4:likes-changed";

let cachedSet: Set<string> | null = null;

function readSet(): Set<string> {
  if (cachedSet) return cachedSet;
  cachedSet = new Set(readStoredJson(STORAGE_KEY, [], isStringList));
  return cachedSet;
}

function writeSet(set: Set<string>): void {
  cachedSet = set;
  writeStoredJson(STORAGE_KEY, Array.from(set));
  dispatchStoredValueChanged(CHANGE_EVENT);
}

function invalidateCache(): void {
  cachedSet = null;
}

export function isLiked(slug: string): boolean {
  return readSet().has(slug);
}

export function getLikedSlugs(): string[] {
  return Array.from(readSet());
}

export function toggleLike(slug: string): boolean {
  const current = readSet();
  const next = new Set(current);
  if (next.has(slug)) {
    next.delete(slug);
    writeSet(next);
    return false;
  }
  next.add(slug);
  writeSet(next);
  return true;
}

export function subscribe(listener: () => void): () => void {
  return subscribeStoredValue(STORAGE_KEY, CHANGE_EVENT, () => {
    invalidateCache();
    listener();
  });
}

export const LIKES_STORAGE_KEY = STORAGE_KEY;

function isStringList(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  );
}
