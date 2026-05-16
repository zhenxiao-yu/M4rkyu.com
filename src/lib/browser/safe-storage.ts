const memoryFallback = new Map<string, string>();

function getStorage(kind: "local" | "session"): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    const storage =
      kind === "local" ? window.localStorage : window.sessionStorage;
    const probe = "__m4rkyu_storage_probe__";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

function scopedKey(kind: "local" | "session", key: string): string {
  return `${kind}:${key}`;
}

export function readStoredString(
  key: string,
  fallback = "",
  kind: "local" | "session" = "local",
): string {
  const storage = getStorage(kind);
  const value =
    storage?.getItem(key) ?? memoryFallback.get(scopedKey(kind, key)) ?? null;
  return value ?? fallback;
}

export function writeStoredString(
  key: string,
  value: string,
  kind: "local" | "session" = "local",
): void {
  const storage = getStorage(kind);

  try {
    storage?.setItem(key, value);
  } catch {
    memoryFallback.set(scopedKey(kind, key), value);
  }

  if (!storage) memoryFallback.set(scopedKey(kind, key), value);
}

export function removeStoredValue(
  key: string,
  kind: "local" | "session" = "local",
): void {
  const storage = getStorage(kind);
  memoryFallback.delete(scopedKey(kind, key));

  try {
    storage?.removeItem(key);
  } catch {
    /* Storage unavailable; memory fallback is already cleared. */
  }
}

export function readStoredJson<T>(
  key: string,
  fallback: T,
  isValid: (value: unknown) => value is T,
): T {
  const raw = readStoredString(key, "");
  if (!raw) return fallback;

  try {
    const parsed = JSON.parse(raw);
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function writeStoredJson(key: string, value: unknown): void {
  writeStoredString(key, JSON.stringify(value));
}

export function dispatchStoredValueChanged(eventName: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(eventName));
}

export function subscribeStoredValue(
  key: string,
  eventName: string,
  callback: () => void,
): () => void {
  if (typeof window === "undefined") return () => undefined;

  function onStorage(event: StorageEvent) {
    if (event.key === key) callback();
  }

  window.addEventListener("storage", onStorage);
  window.addEventListener(eventName, callback);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(eventName, callback);
  };
}
