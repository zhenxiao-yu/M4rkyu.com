import { getTranslations } from "next-intl/server";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listPendingComments } from "@/lib/comments/comments";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { CommentRow } from "@/lib/supabase/types";
import type { Locale } from "@/i18n/routing";
import { AdminPageHeader } from "../_components/admin-page-header";
import { ModerationControls } from "./_controls";

export const dynamic = "force-dynamic";

export default async function AdminCommentsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Admin" });
  const tComments = await getTranslations({ locale, namespace: "Comments" });

  // Pending first; then the most recent of every other status for context.
  const pending = await listPendingComments();
  const supabase = await createSupabaseServerClient();
  const { data: recent } = await supabase
    .from("comments")
    .select("*")
    .neq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(20);
  const recentRows = (recent ?? []) as CommentRow[];

  return (
    <>
      <AdminPageHeader
        eyebrow={t("eyebrow")}
        title={t("commentsTitle")}
        description={t("commentsDescription")}
      />

      <section className="grid gap-4">
          <h2 className="text-lg font-semibold">
            {t("pendingHeading", { count: pending.length })}
          </h2>
          {pending.length === 0 ? (
            <Card className="bg-card/80">
              <CardContent className="py-6 text-center text-sm text-muted-foreground">
                {t("pendingEmpty")}
              </CardContent>
            </Card>
          ) : (
            <ul className="grid gap-3">
              {pending.map((c) => (
                <li key={c.id}>
                  <Card className="bg-card/80">
                    <CardContent className="grid gap-2 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span>
                          {c.author?.display_name ??
                            c.author?.username ??
                            tComments("anonymous")}
                        </span>
                        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                          {c.item_type} · {c.item_key}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-6">
                        {c.body}
                      </p>
                      <ModerationControls id={c.id} status={c.status} />
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-10 grid gap-4">
          <h2 className="text-lg font-semibold">{t("recentHeading")}</h2>
          {recentRows.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {t("recentEmpty")}
            </p>
          ) : (
            <ul className="grid gap-3">
              {recentRows.map((c) => (
                <li key={c.id}>
                  <Card className="bg-card/40">
                    <CardContent className="grid gap-2 py-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                          {c.item_type} · {c.item_key}
                        </span>
                        <Badge variant="outline">
                          {tComments(`status.${c.status}`)}
                        </Badge>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                        {c.body}
                      </p>
                      <ModerationControls id={c.id} status={c.status} />
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
      </section>
    </>
  );
}
