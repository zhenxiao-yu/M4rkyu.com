"use client";

import { useSyncExternalStore } from "react";
import * as likes from "./likes";
import * as saves from "./saves";

export function useIsLiked(slug: string): boolean {
  return useSyncExternalStore(
    likes.subscribe,
    () => likes.isLiked(slug),
    () => false,
  );
}

export function useIsSaved(slug: string): boolean {
  return useSyncExternalStore(
    saves.subscribe,
    () => saves.isSaved(slug),
    () => false,
  );
}

export function useSavedSlugs(): string[] {
  return useSyncExternalStore(
    saves.subscribe,
    () => saves.getSavedSlugs(),
    () => [],
  );
}
