import "server-only";

import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

// Shared label bags for the gallery admin forms. Built once per page
// from the AdminGallery.* namespace so the form components stay free of
// next-intl plumbing and the bilingual copy surface lives in one place.

async function status(t: Awaited<ReturnType<typeof getTranslations>>) {
  return {
    ready: t("status.ready"),
    draft: t("status.draft"),
    placeholder: t("status.placeholder"),
    comingSoon: t("status.comingSoon"),
  };
}

export async function buildCollectionFormLabels(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "AdminGallery" });
  return {
    basics: t("section.basics"),
    titleLabel: t("titleLabel"),
    slugLabel: t("slugLabel"),
    slugHint: t("slugHint"),
    descriptionLabel: t("descriptionLabel"),
    statusLabel: t("statusLabel"),
    sortOrderLabel: t("sortOrderLabel"),
    featuredLabel: t("featured"),
    coverAltLabel: t("coverAltLabel"),
    coverAltHint: t("coverAltHint"),
    submit: t("save"),
    cancel: t("cancel"),
    status: await status(t),
  };
}

export async function buildItemFormLabels(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "AdminGallery" });
  return {
    basics: t("section.basics"),
    detail: t("section.detail"),
    titleLabel: t("titleLabel"),
    slugLabel: t("slugLabel"),
    slugHint: t("slugHint"),
    imageLabel: t("imageLabel"),
    imageHint: t("imageHint"),
    imageReplaceHint: t("imageReplaceHint"),
    dropzone: {
      prompt: t("dropzone.prompt"),
      replacePrompt: t("dropzone.replacePrompt"),
      current: t("dropzone.current"),
      browse: t("dropzone.browse"),
      clear: t("dropzone.clear"),
      tooLarge: t("dropzone.tooLarge"),
      wrongType: t("dropzone.wrongType"),
    },
    captionLabel: t("captionLabel"),
    altLabel: t("altLabel"),
    altHint: t("altHint"),
    typeLabel: t("typeLabel"),
    aspectLabel: t("aspectLabel"),
    statusLabel: t("statusLabel"),
    sortOrderLabel: t("sortOrderLabel"),
    locationLabel: t("locationLabel"),
    capturedAtLabel: t("capturedAtLabel"),
    capturedAtHint: t("capturedAtHint"),
    featuredLabel: t("featured"),
    pinnedLabel: t("pinned"),
    submit: t("save"),
    cancel: t("cancel"),
    status: await status(t),
    itemType: {
      image: t("itemType.image"),
      contactSheet: t("itemType.contactSheet"),
      process: t("itemType.process"),
    },
  };
}
