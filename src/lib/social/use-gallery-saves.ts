"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

/**
 * Client-side read of the signed-in user's saved gallery slugs.
 *
 * Moving this off the server is what lets /archive + /archive/[collection]
 * render statically / ISR: the page no longer reads request cookies for
 * per-user save state. On mount we read the session from the browser
 * Supabase client, then (if signed in) query `user_saved_items` directly —
 * RLS scopes the rows to the current user, so no explicit user filter is
 * needed beyond `item_type = 'gallery'`.
 *
 * Tradeoff: a guest paint of save state for a beat before the session and
 * saved set resolve, exactly like `<UserMenu />`.
 */
export function useGallerySaves(): {
  savedSlugs: Set<string>;
  signedIn: boolean;
} {
  const [savedSlugs, setSavedSlugs] = useState<Set<string>>(new Set());
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    const supabase = createSupabaseBrowserClient();
    let active = true;

    void (async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (!active) return;
      if (!userData.user) {
        setSignedIn(false);
        setSavedSlugs(new Set());
        return;
      }
      setSignedIn(true);

      const { data, error } = await supabase
        .from("user_saved_items")
        .select("item_key")
        .eq("item_type", "gallery");
      if (!active) return;
      if (error || !data) {
        setSavedSlugs(new Set());
        return;
      }
      setSavedSlugs(
        new Set((data as { item_key: string }[]).map((row) => row.item_key)),
      );
    })();

    return () => {
      active = false;
    };
  }, []);

  return { savedSlugs, signedIn };
}
