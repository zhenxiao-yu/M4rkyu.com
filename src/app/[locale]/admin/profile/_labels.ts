import "server-only";

import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";

// Shared label bag for ProfileForm. Built once per page from the
// AdminProfile.* namespace so the form component stays free of
// next-intl plumbing and the bilingual copy surface lives in one
// place.
export async function buildProfileFormLabels(locale: Locale) {
  const t = await getTranslations({ locale, namespace: "AdminProfile" });

  return {
    save: t("save"),
    cancel: t("cancel"),
    savedHint: t("savedHint"),
    required: t("required"),
    structuredHint: t("structuredHint"),
    jsonHint: t("jsonHint"),
    section: {
      identity: t("section.identity"),
      intro: t("section.intro"),
      socials: t("section.socials"),
      structured: t("section.structured"),
    },
    nameLabel: t("nameLabel"),
    titleLabel: t("titleLabel"),
    locationLabel: t("locationLabel"),
    emailLabel: t("emailLabel"),
    githubHandleLabel: t("githubHandleLabel"),
    resumeUrlLabel: t("resumeUrlLabel"),
    introLabel: t("introLabel"),
    socialGithubLabel: t("socialGithubLabel"),
    socialDevtoLabel: t("socialDevtoLabel"),
    socialLinkedinLabel: t("socialLinkedinLabel"),
    socialBlueskyLabel: t("socialBlueskyLabel"),
    socialTwitterLabel: t("socialTwitterLabel"),
    socialInstagramLabel: t("socialInstagramLabel"),
    socialMastodonLabel: t("socialMastodonLabel"),
    socialFacebookLabel: t("socialFacebookLabel"),
    socialYoutubeLabel: t("socialYoutubeLabel"),
    socialCodepenLabel: t("socialCodepenLabel"),
    socialSpotifyLabel: t("socialSpotifyLabel"),
    socialSnapchatLabel: t("socialSnapchatLabel"),
    socialWechatLabel: t("socialWechatLabel"),
    socialDiscordLabel: t("socialDiscordLabel"),
    socialBuymeacoffeeLabel: t("socialBuymeacoffeeLabel"),
    timelineLabel: t("timelineLabel"),
    valuesLabel: t("valuesLabel"),
    skillsLabel: t("skillsLabel"),
    citiesLabel: t("citiesLabel"),
    currentlyLabel: t("currentlyLabel"),
    portraitsLabel: t("portraitsLabel"),
  };
}
