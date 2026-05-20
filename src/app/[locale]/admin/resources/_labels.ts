import "server-only";

import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

// Shared label bag for ResourceForm. Built once per page from the
// AdminResources.* namespace so the form component stays free of
// next-intl plumbing and the bilingual copy surface lives in one place.
export async function buildResourceFormLabels(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "AdminResources" });

  return {
    required: t("required"),
    basics: t("section.basics"),
    detail: t("section.detail"),
    links: t("section.links"),
    nameLabel: t("nameLabel"),
    slugLabel: t("slugLabel"),
    slugHint: t("slugHint"),
    categoryLabel: t("categoryLabel"),
    typeLabel: t("typeLabel"),
    statusLabel: t("statusLabel"),
    pricingLabel: t("pricingLabel"),
    sortOrderLabel: t("sortOrderLabel"),
    linkLabel: t("linkLabel"),
    descriptionLabel: t("descriptionLabel"),
    whyLabel: t("whyLabel"),
    tagsLabel: t("tagsLabel"),
    tagsHint: t("tagsHint"),
    iconKeyLabel: t("iconKeyLabel"),
    iconKeyHint: t("iconKeyHint"),
    featured: t("featured"),
    submit: t("save"),
    cancel: t("cancel"),
    type: {
      link: t("type.link"),
      tool: t("type.tool"),
    },
    status: {
      ready: t("status.ready"),
      draft: t("status.draft"),
      placeholder: t("status.placeholder"),
      comingSoon: t("status.comingSoon"),
    },
  };
}
