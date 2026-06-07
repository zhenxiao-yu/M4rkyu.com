import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth/require-admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { notFound } from "next/navigation";
import type { Locale } from "@/i18n/routing";
import { AdminCommandPalette } from "./_components/admin-command-palette";
import { AdminShell } from "./_components/admin-shell";

export const dynamic = "force-dynamic";

// Privileged surface — never index, never follow links out of it.
// Inherited by the whole /admin subtree (defense-in-depth alongside
// the robots.ts disallow and the auth gate below).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // 404 — not 403 — so unauthenticated browsers don't even confirm
  // the admin surface exists. RLS enforces the same thing server-side
  // for any data reads inside the subtree.
  if (!isSupabaseConfigured()) notFound();
  await requireAdmin();
  const { locale } = await params;
  return (
    <>
      <AdminShell locale={locale as Locale}>{children}</AdminShell>
      <AdminCommandPalette />
    </>
  );
}
