import "server-only";

import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildDropzoneLabels } from "@/lib/admin/dropzone-labels";

// Shared label bag for ProductForm. Built once per page from the
// AdminShop.* namespace so the form component stays free of next-intl
// plumbing and the bilingual copy surface lives in one place.
export async function buildProductFormLabels(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "AdminShop" });
  const dropzone = await buildDropzoneLabels(locale);

  return {
    dropzone,
    basics: t("section.basics"),
    pricing: t("section.pricing"),
    detail: t("section.detail"),
    media: t("section.media"),
    titleLabel: t("titleLabel"),
    slugLabel: t("slugLabel"),
    slugHint: t("slugHint"),
    summaryLabel: t("summaryLabel"),
    summaryHint: t("summaryHint"),
    descriptionLabel: t("descriptionLabel"),
    categoryLabel: t("categoryLabel"),
    categoryHint: t("categoryHint"),
    kindLabel: t("kindLabel"),
    priceLabel: t("priceLabel"),
    priceHint: t("priceHint"),
    statusLabel: t("statusLabel"),
    sortOrderLabel: t("sortOrderLabel"),
    tagsLabel: t("tagsLabel"),
    tagsHint: t("tagsHint"),
    digitalNoteLabel: t("digitalNoteLabel"),
    digitalNoteHint: t("digitalNoteHint"),
    imageLabel: t("imageLabel"),
    imageHint: t("imageHint"),
    imageReplaceHint: t("imageReplaceHint"),
    imageAltLabel: t("imageAltLabel"),
    imageAltHint: t("imageAltHint"),
    currentImage: t("currentImage"),
    featuredLabel: t("featuredLabel"),
    inStockLabel: t("inStockLabel"),
    submit: t("save"),
    cancel: t("cancel"),
    kind: {
      physical: t("kind.physical"),
      digital: t("kind.digital"),
    },
    status: {
      ready: t("status.ready"),
      draft: t("status.draft"),
      placeholder: t("status.placeholder"),
      comingSoon: t("status.comingSoon"),
    },
  };
}
