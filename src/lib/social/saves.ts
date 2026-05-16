// Phase 1: visitor-local saves. Same shape as likes, separate storage key.
// A future backend sync (see docs/GALLERY_SOCIAL_SPEC.md §7) will replace
// the body of these functions; UI code never imports localStorage directly.

import {
  dispatchStoredValueChanged,
  readStoredJson,
  subscribeStoredValue,
  writeStoredJson,
} from "@/lib/browser/safe-storage";

const STORAGE_KEY = "m4_saved_frames";
const MAX_SAVED = 200;
const CHANGE_EVENT = "m4:saves-changed";

let cachedList: string[] | null = null;

function readList(): string[] {
  if (cachedList) return cachedList;
  cachedList = readStoredJson(STORAGE_KEY, [], isStringList).slice(
    0,
    MAX_SAVED,
  );
  return cachedList;
}

function writeList(list: string[]): void {
  cachedList = list;
  writeStoredJson(STORAGE_KEY, list);
  dispatchStoredValueChanged(CHANGE_EVENT);
}

function invalidateCache(): void {
  cachedList = null;
}

export function isSaved(slug: string): boolean {
  return readList().includes(slug);
}

export function getSavedSlugs(): string[] {
  return readList();
}

export function clearAll(): void {
  writeList([]);
}

export function toggleSave(slug: string): boolean {
  const current = readList();
  const index = current.indexOf(slug);
  if (index >= 0) {
    const next = [...current.slice(0, index), ...current.slice(index + 1)];
    writeList(next);
    return false;
  }
  const next = [slug, ...current];
  if (next.length > MAX_SAVED) next.length = MAX_SAVED;
  writeList(next);
  return true;
}

export function subscribe(listener: () => void): () => void {
  return subscribeStoredValue(STORAGE_KEY, CHANGE_EVENT, () => {
    invalidateCache();
    listener();
  });
}

export const SAVES_STORAGE_KEY = STORAGE_KEY;

function isStringList(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((entry) => typeof entry === "string")
  );
}
