import "server-only";

import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { buildDropzoneLabels } from "@/lib/admin/dropzone-labels";

// Shared label bag for ProjectForm. Built once per page from
// AdminProjects.* + Categories.* + Status.* namespaces so the form
// component stays free of next-intl plumbing and the bilingual copy
// surface lives in one place.
export async function buildProjectFormLabels(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "AdminProjects" });
  const tCategories = await getTranslations({ locale, namespace: "Categories" });
  const dropzone = await buildDropzoneLabels(locale);

  return {
    dropzone,
    required: t("required"),
    basics: t("section.basics"),
    titleLabel: t("titleLabel"),
    slugLabel: t("slugLabel"),
    slugHint: t("slugHint"),
    yearLabel: t("yearLabel"),
    categoryLabel: t("categoryLabel"),
    statusLabel: t("statusLabel"),
    contentStatusLabel: t("contentStatusLabel"),
    featured: t("featured"),
    shortPitchLabel: t("shortPitchLabel"),
    shortPitchHint: t("shortPitchHint"),
    caseStudy: t("section.caseStudy"),
    problemLabel: t("problemLabel"),
    solutionLabel: t("solutionLabel"),
    roleLabel: t("roleLabel"),
    outcomeLabel: t("outcomeLabel"),
    stackLabel: t("stackLabel"),
    stackHint: t("arrayHint"),
    tagsLabel: t("tagsLabel"),
    tagsHint: t("tagsHint"),
    featuresLabel: t("featuresLabel"),
    architectureLabel: t("architectureLabel"),
    challengesLabel: t("challengesLabel"),
    lessonsLabel: t("lessonsLabel"),
    nextStepsLabel: t("nextStepsLabel"),
    links: t("section.links"),
    liveUrlLabel: t("liveUrlLabel"),
    githubUrlLabel: t("githubUrlLabel"),
    cover: t("section.cover"),
    coverSrcLabel: t("coverSrcLabel"),
    coverAltLabel: t("coverAltLabel"),
    imageLabel: t("imageLabel"),
    imageHint: t("imageHint"),
    imageReplaceHint: t("imageReplaceHint"),
    currentImage: t("currentImage"),
    seo: t("section.seo"),
    seoTitleLabel: t("seoTitleLabel"),
    seoDescriptionLabel: t("seoDescriptionLabel"),
    sortOrderLabel: t("sortOrderLabel"),
    submit: t("save"),
    cancel: t("cancel"),
    category: {
      "web-app": tCategories("web-app"),
      "game-dev": tCategories("game-dev"),
      "ai-tool": tCategories("ai-tool"),
      "art-film": tCategories("art-film"),
      experiment: tCategories("experiment"),
      maintenance: tCategories("maintenance"),
    },
    status: {
      ready: t("status.ready"),
      development: t("status.development"),
      maintenance: t("status.maintenance"),
      archived: t("status.archived"),
      draft: t("status.draft"),
    },
    contentStatus: {
      ready: t("contentStatus.ready"),
      draft: t("contentStatus.draft"),
      placeholder: t("contentStatus.placeholder"),
      comingSoon: t("contentStatus.comingSoon"),
    },
  };
}
