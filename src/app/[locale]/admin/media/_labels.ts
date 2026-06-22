import "server-only";

import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildDropzoneLabels } from "@/lib/admin/dropzone-labels";

// Shared label bag for MediaForm. Built once per page from the
// AdminMedia.* namespace so the form component stays free of
// next-intl plumbing and the bilingual copy surface lives in one
// place.
export async function buildMediaFormLabels(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "AdminMedia" });
  const dropzone = await buildDropzoneLabels(locale);

  return {
    dropzone,
    required: t("required"),
    basics: t("section.basics"),
    detail: t("section.detail"),
    titleLabel: t("titleLabel"),
    slugLabel: t("slugLabel"),
    slugHint: t("slugHint"),
    formatLabel: t("formatLabel"),
    statusLabel: t("statusLabel"),
    sortOrderLabel: t("sortOrderLabel"),
    descriptionLabel: t("descriptionLabel"),
    durationLabel: t("durationLabel"),
    durationHint: t("durationHint"),
    media: t("section.media"),
    imageLabel: t("imageLabel"),
    imageHint: t("imageHint"),
    imageReplaceHint: t("imageReplaceHint"),
    posterAltLabel: t("posterAltLabel"),
    posterAltHint: t("posterAltHint"),
    removePoster: t("removePoster"),
    currentImage: t("currentImage"),
    submit: t("save"),
    cancel: t("cancel"),
    format: {
      video: t("format.video"),
      reel: t("format.reel"),
      process: t("format.process"),
      poster: t("format.poster"),
    },
    status: {
      ready: t("status.ready"),
      draft: t("status.draft"),
      placeholder: t("status.placeholder"),
      comingSoon: t("status.comingSoon"),
    },
  };
}
