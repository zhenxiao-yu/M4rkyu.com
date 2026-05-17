// Database type stub.
//
// In a follow-up PR run:
//
//   supabase gen types typescript --project-id <ref> --schema public \
//     > src/lib/supabase/types.ts
//
// That overwrites this file with the fully typed Database interface.
// Until then, queries are typed loosely as `unknown` rows — every
// consumer in `src/lib/{auth,comments,admin}` validates the shape it
// reads, so the runtime is safe; we just lose some compile-time hints.

export type CommentStatus = "pending" | "approved" | "rejected" | "hidden";

export type SavedItemType =
  | "project"
  | "gallery"
  | "log"
  | "game"
  | "resource"
  | "note";

export type CommentItemType = "project" | "gallery" | "log" | "game" | "note";

export interface ProfileRow {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  website: string | null;
  bio: string | null;
  role: "user" | "admin";
  public_profile: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferencesRow {
  user_id: string;
  email_notifications: boolean;
  theme_preference: "light" | "dark" | "system" | null;
  locale_preference: "en" | "zh" | null;
  created_at: string;
  updated_at: string;
}

export interface SavedItemRow {
  user_id: string;
  item_type: SavedItemType;
  item_key: string;
  saved_at: string;
}

export interface CommentRow {
  id: string;
  user_id: string | null;
  parent_id: string | null;
  item_type: CommentItemType;
  item_key: string;
  body: string;
  status: CommentStatus;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
}
