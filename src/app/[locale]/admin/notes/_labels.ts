import "server-only";

import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

// Shared label bag for NoteForm. Built once per page from the
// AdminNotes.* namespace so the form component stays free of next-intl
// plumbing and the bilingual copy surface lives in one place.
export async function buildNoteFormLabels(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "AdminNotes" });

  return {
    basics: t("section.basics"),
    content: t("section.content"),
    link: t("section.link"),
    review: t("section.review"),
    tierlist: t("section.tierlist"),
    kindLabel: t("kindLabel"),
    titleLabel: t("titleLabel"),
    titleHint: t("titleHint"),
    slugLabel: t("slugLabel"),
    slugHint: t("slugHint"),
    statusLabel: t("statusLabel"),
    publishedAtLabel: t("publishedAtLabel"),
    sortOrderLabel: t("sortOrderLabel"),
    sortOrderHint: t("sortOrderHint"),
    bodyLabel: t("bodyLabel"),
    bodyHint: t("bodyHint"),
    tagsLabel: t("tagsLabel"),
    tagsHint: t("tagsHint"),
    linkUrlLabel: t("linkUrlLabel"),
    linkUrlHint: t("linkUrlHint"),
    linkLabelLabel: t("linkLabelLabel"),
    linkLabelHint: t("linkLabelHint"),
    ratingLabel: t("ratingLabel"),
    ratingHint: t("ratingHint"),
    tiersLabel: t("tiersLabel"),
    tiersHint: t("tiersHint"),
    submit: t("save"),
    cancel: t("cancel"),
    kind: {
      update: t("kind.update"),
      repost: t("kind.repost"),
      note: t("kind.note"),
      review: t("kind.review"),
      tierlist: t("kind.tierlist"),
    },
    status: {
      ready: t("status.ready"),
      draft: t("status.draft"),
      placeholder: t("status.placeholder"),
      comingSoon: t("status.comingSoon"),
    },
    ratingOption: { none: t("ratingNone") },
  };
}
