// Phase 1: visitor-local likes. The visitor's own toggle state is the only
// real state that exists today. Public counts are not surfaced because no
// backend is wired yet (see docs/GALLERY_SOCIAL_SPEC.md §13).
//
// This module is the single boundary between UI code and storage. When a
// backend lands, swap the body of the four exported functions and leave the
// signatures intact.

const STORAGE_KEY = "m4_liked_frames";

let cachedSet: Set<string> | null = null;

function readSet(): Set<string> {
  if (cachedSet) return cachedSet;
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cachedSet = new Set();
      return cachedSet;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      cachedSet = new Set();
      return cachedSet;
    }
    cachedSet = new Set(
      parsed.filter((value): value is string => typeof value === "string"),
    );
    return cachedSet;
  } catch {
    cachedSet = new Set();
    return cachedSet;
  }
}

function writeSet(set: Set<string>): void {
  cachedSet = set;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
    window.dispatchEvent(new CustomEvent("m4:likes-changed"));
  } catch {
    // Storage may be unavailable (private mode, quota); fail soft.
  }
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
  window.addEventListener("m4:likes-changed", localHandler);
  return () => {
    window.removeEventListener("storage", storageHandler);
    window.removeEventListener("m4:likes-changed", localHandler);
  };
}

export const LIKES_STORAGE_KEY = STORAGE_KEY;
