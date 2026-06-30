"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveState = "idle" | "saving" | "saved" | "error";

export interface AutosaveResult {
  ok: boolean;
  error?: string;
}

export function useAutosaveField<T>({
  initialValue,
  save,
  delay = 800,
}: {
  initialValue: T;
  save: (value: T) => Promise<AutosaveResult>;
  delay?: number;
}): {
  value: T;
  setValue: (value: T) => void;
  status: SaveState;
  flush: () => void;
} {
  const [value, setValueState] = useState<T>(initialValue);
  const [status, setStatus] = useState<SaveState>("idle");
  const savedRef = useRef<T>(initialValue); // last value persisted
  const latestRef = useRef<T>(initialValue); // most recent edit
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const commit = useCallback(
    async (next: T) => {
      if (Object.is(next, savedRef.current)) {
        setStatus("idle");
        return;
      }
      setStatus("saving");
      try {
        const res = await save(next);
        if (!Object.is(next, latestRef.current)) return; // stale; a newer edit superseded it
        if (res.ok) {
          savedRef.current = next;
          setStatus("saved");
        } else {
          setStatus("error");
        }
      } catch {
        if (Object.is(next, latestRef.current)) setStatus("error");
      }
    },
    [save],
  );

  const setValue = useCallback(
    (next: T) => {
      latestRef.current = next;
      setValueState(next);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void commit(next), delay);
    },
    [commit, delay],
  );

  const flush = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    void commit(latestRef.current);
  }, [commit]);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );

  return { value, setValue, status, flush };
}
