import { getTranslations } from "next-intl/server";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { listCommentsForItem } from "@/lib/comments/comments";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { CommentItemType } from "@/lib/supabase/types";
import { CommentForm } from "./comment-form";
import type { Locale } from "@/i18n/routing";

interface CommentThreadProps {
  itemType: CommentItemType;
  itemKey: string;
  locale: Locale;
  /** Path the user should bounce back to after sign-in. */
  nextPath: string;
}

/**
 * Server component. Renders the approved-comments list for an item
 * (plus the author's own pending entries via RLS), followed by the
 * comment-form client island.
 *
 * Hides itself entirely when Supabase is unconfigured. Pages that
 * embed this don't need to gate it themselves.
 */
export async function CommentThread({
  itemType,
  itemKey,
  locale,
  nextPath,
}: CommentThreadProps) {
  if (!isSupabaseConfigured()) return null;

  const t = await getTranslations({ locale, namespace: "Comments" });
  const [user, comments] = await Promise.all([
    getCurrentUser(),
    listCommentsForItem(itemType, itemKey),
  ]);
  const signedIn = Boolean(user);

  const approvedCount = comments.filter((c) => c.status === "approved").length;

  return (
    <section className="grid gap-6">
      <header className="flex items-baseline justify-between gap-3">
        <h2 className="text-lg font-semibold">{t("heading")}</h2>
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground">
          {t("count", { count: approvedCount })}
        </span>
      </header>

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="grid gap-4">
          {comments.map((comment) => {
            const author = comment.author;
            const isOwn = user?.id === comment.user_id;
            const showStatusBadge = comment.status !== "approved";
            return (
              <li key={comment.id} className="grid gap-1.5">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-medium text-foreground">
                    {author?.display_name ?? author?.username ?? t("anonymous")}
                  </span>
                  <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                    {new Date(comment.created_at).toISOString().slice(0, 10)}
                  </span>
                  {comment.is_edited ? (
                    <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                      · {t("edited")}
                    </span>
                  ) : null}
                  {showStatusBadge ? (
                    <Badge variant="outline">{t(`status.${comment.status}`)}</Badge>
                  ) : null}
                  {isOwn && comment.status !== "approved" ? (
                    <Badge variant="outline">{t("ownPending")}</Badge>
                  ) : null}
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6">
                  {comment.body}
                </p>
              </li>
            );
          })}
        </ul>
      )}

      <CommentForm
        itemType={itemType}
        itemKey={itemKey}
        signedIn={signedIn}
        nextPath={nextPath}
      />
    </section>
  );
}
