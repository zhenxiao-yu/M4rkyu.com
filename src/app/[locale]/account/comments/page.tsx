import { getTranslations } from "next-intl/server";
import { PageShell } from "@/components/layout/page-shell";
import { PageHero } from "@/components/layout/page-hero";
import { PageSection } from "@/components/layout/page-section";
import { requireUser } from "@/lib/auth/require-user";
import { listOwnComments } from "@/lib/comments/comments";
import type { CommentStatus } from "@/lib/supabase/types";
import type { Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";
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
          /* Empty state — same wall-label panel with a vertical
           * ring-tinted hairline used on the saved page, so the two
           * indexes read as one design. */
          <div className="relative max-w-xl rounded-[1.25rem] glass-surface p-6 pl-7">
            <span
              aria-hidden="true"
              className="absolute left-3 top-6 bottom-6 w-px bg-linear-to-b from-ring/60 via-ring/25 to-transparent"
            />
            <p className="font-mono text-[0.6rem] uppercase tracking-[0.22em] text-muted-foreground">
              {t("commentsTitle")}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {t("commentsEmpty")}
            </p>
          </div>
        ) : (
          <ol className="grid gap-3">
            {comments.map((comment, index) => (
              <CommentEntry
                key={comment.id}
                channel={String(index + 1).padStart(2, "0")}
                itemType={comment.item_type}
                itemKey={comment.item_key}
                status={comment.status}
                statusLabel={tComments(`status.${comment.status}`)}
                body={comment.body}
                date={new Date(comment.created_at).toISOString().slice(0, 10)}
              />
            ))}
          </ol>
        )}
      </PageSection>
    </PageShell>
  );
}

function CommentEntry({
  channel,
  itemType,
  itemKey,
  status,
  statusLabel,
  body,
  date,
}: {
  channel: string;
  itemType: string;
  itemKey: string;
  status: CommentStatus;
  statusLabel: string;
  body: string;
  date: string;
}) {
  return (
    <li className="group relative overflow-hidden rounded-lg glass-surface transition-colors duration-(--motion-medium) ease-(--ease-premium)">
      {/* Left accent rule — the shared field-notebook entry signature,
        * igniting to --ring on hover. */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-3 bottom-3 w-[2px] rounded-full bg-border/70 transition-colors duration-(--motion-medium) ease-(--ease-premium) group-hover:bg-ring"
      />
      <div className="grid grid-cols-[2.5rem_1fr] gap-3 p-4 pl-5 sm:p-5 sm:pl-6">
        <span
          aria-hidden="true"
          className="font-pixel text-xl leading-none tabular-nums text-muted-foreground/70 transition-colors duration-(--motion-fast) ease-(--ease-premium) group-hover:text-foreground"
        >
          {channel}
        </span>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="truncate font-mono text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
              {itemType} · {itemKey}
            </span>
            <StatusChip status={status} label={statusLabel} />
          </div>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-foreground/90">
            {body}
          </p>

          <p className="mt-3 font-pixel text-sm leading-none tabular-nums text-muted-foreground/60">
            {date.replaceAll("-", ".")}
          </p>
        </div>
      </div>
    </li>
  );
}

// Moderation state as a colour-coded chip. In-progress (pending) borrows
// the single --ring accent; rejected/hidden use --signal (the only other
// semantic colour). Approved stays neutral so the common case is quiet.
function StatusChip({
  status,
  label,
}: {
  status: CommentStatus;
  label: string;
}) {
  const tone =
    status === "pending"
      ? "border-ring/40 bg-ring/10 text-foreground"
      : status === "rejected" || status === "hidden"
        ? "border-signal/40 bg-signal/10 text-signal"
        : "border-border/60 bg-card/60 text-muted-foreground";

  const dot =
    status === "pending"
      ? "bg-ring"
      : status === "rejected" || status === "hidden"
        ? "bg-signal"
        : "bg-foreground/40";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 font-mono text-[0.58rem] uppercase tracking-[0.14em]",
        tone,
      )}
    >
      <span aria-hidden="true" className={cn("size-1 rounded-full", dot)} />
      {label}
    </span>
  );
}
