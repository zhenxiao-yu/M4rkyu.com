import "server-only";

import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

// Shared label bag for GameForm. Built once per page from the
// AdminGames.* namespace so the form component stays free of
// next-intl plumbing and the bilingual copy surface lives in one
// place.
export async function buildGameFormLabels(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "AdminGames" });

  return {
    required: t("required"),
    basics: t("section.basics"),
    detail: t("section.detail"),
    media: t("section.media"),
    titleLabel: t("titleLabel"),
    slugLabel: t("slugLabel"),
    slugHint: t("slugHint"),
    engineLabel: t("engineLabel"),
    yearLabel: t("yearLabel"),
    statusLabel: t("statusLabel"),
    sortOrderLabel: t("sortOrderLabel"),
    pitchLabel: t("pitchLabel"),
    roleLabel: t("roleLabel"),
    notesLabel: t("notesLabel"),
    notesHint: t("notesHint"),
    platformsLabel: t("platformsLabel"),
    pillarsLabel: t("pillarsLabel"),
    postmortemLabel: t("postmortemLabel"),
    outcomeLabel: t("outcomeLabel"),
    coverSrcLabel: t("coverSrcLabel"),
    coverAltLabel: t("coverAltLabel"),
    trailerUrlLabel: t("trailerUrlLabel"),
    buildLinksLabel: t("buildLinksLabel"),
    buildLinksHint: t("buildLinksHint"),
    submit: t("save"),
    cancel: t("cancel"),
    status: {
      ready: t("status.ready"),
      draft: t("status.draft"),
      placeholder: t("status.placeholder"),
      comingSoon: t("status.comingSoon"),
    },
  };
}
