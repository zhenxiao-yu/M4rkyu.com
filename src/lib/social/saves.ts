// Phase 1: visitor-local saves. Same shape as likes, separate storage key.
// A future backend sync (see docs/GALLERY_SOCIAL_SPEC.md §7) will replace
// the body of these functions; UI code never imports localStorage directly.

const STORAGE_KEY = "m4_saved_frames";
const MAX_SAVED = 200;

let cachedList: string[] | null = null;

function readList(): string[] {
  if (cachedList) return cachedList;
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedList = [];
      return cachedList;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      cachedList = [];
      return cachedList;
    }
    cachedList = parsed.filter((value): value is string => typeof value === "string");
    return cachedList;
  } catch {
    cachedList = [];
    return cachedList;
  }
}

function writeList(list: string[]): void {
  cachedList = list;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("m4:saves-changed"));
  } catch {
    // ignore quota / private-mode failures
  }
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
  if (typeof window === "undefined") return () => {};
  const storageHandler = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      invalidateCache();
      listener();
    }
  };
  const localHandler = () => {
    listener();
  };
  window.addEventListener("storage", storageHandler);
  window.addEventListener("m4:saves-changed", localHandler);
  return () => {
    window.removeEventListener("storage", storageHandler);
    window.removeEventListener("m4:saves-changed", localHandler);
  };
}

export const SAVES_STORAGE_KEY = STORAGE_KEY;
