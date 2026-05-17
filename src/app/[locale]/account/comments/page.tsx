import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUser } from "@/lib/auth/require-user";
import { listOwnComments } from "@/lib/comments/comments";
import type { Locale } from "@/i18n/routing";
import { AccountNav } from "../_components/account-nav";

export const dynamic = "force-dynamic";

export default async function AccountCommentsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  await requireUser(locale);
  const t = await getTranslations({ locale, namespace: "Account" });
  const tComments = await getTranslations({ locale, namespace: "Comments" });

  const comments = await listOwnComments();

  return (
    <PageShell locale={locale}>
      <PageHero
        eyebrow={t("eyebrow")}
        title={t("commentsTitle")}
        description={t("commentsDescription")}
        decorativeWord="THREAD"
      />
      <PageSection>
        <AccountNav locale={locale} />

        {comments.length === 0 ? (
          <Card className="bg-card/80">
            <CardContent className="py-12 text-center">
              <p className="text-base text-muted-foreground">{t("commentsEmpty")}</p>
            </CardContent>
          </Card>
        ) : (
          <ul className="grid gap-3">
            {comments.map((comment) => (
              <li key={comment.id}>
                <Card className="bg-card/80">
                  <CardContent className="grid gap-2 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                        {comment.item_type} · {comment.item_key}
                      </span>
                      <Badge variant="outline">
                        {tComments(`status.${comment.status}`)}
                      </Badge>
                    </div>
                    <p className="whitespace-pre-wrap text-sm leading-6">
                      {comment.body}
                    </p>
                    <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                      {new Date(comment.created_at).toISOString().slice(0, 10)}
                    </p>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </PageSection>
    </PageShell>
  );
}
