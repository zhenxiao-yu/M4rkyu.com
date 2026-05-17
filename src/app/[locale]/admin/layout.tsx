import { requireAdmin } from "@/lib/auth/require-admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 404 — not 403 — so unauthenticated browsers don't even confirm
  // the admin surface exists. RLS enforces the same thing server-side
  // for any data reads inside the subtree.
  if (!isSupabaseConfigured()) notFound();
  await requireAdmin();
  return <>{children}</>;
}
