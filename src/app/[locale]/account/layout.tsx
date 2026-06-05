import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const dynamic = "force-dynamic";

// Personal area — never index, never follow. Inherited by the whole
// /account subtree (defense-in-depth alongside robots.ts + auth gate).
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// `params.locale` is typed as `string` (not the `Locale` union) to
// match Next 16's generated LayoutConfig contract — the same shape
// `[locale]/layout.tsx` uses.
export default async function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isSupabaseConfigured()) {
    // No Supabase configured in this environment — account UI cannot
    // function. Bounce to the home with a benign signal so the page
    // can show "auth unavailable" copy if it wants. For now, just
    // redirect; the home doesn't render an error from the param yet.
    redirect(`/${locale}`);
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}`);
  }

  return <>{children}</>;
}
