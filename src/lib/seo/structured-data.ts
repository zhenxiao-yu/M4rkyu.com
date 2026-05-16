import type { Locale } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo/site";

export function buildSiteJsonLd(locale: Locale) {
  const localePath = `${SITE_URL}/${locale}`;
  const personId = `${SITE_URL}/#person`;
  const websiteId = `${SITE_URL}/#website`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": personId,
        name: "ZhenXiao Mark Yu",
        alternateName: ["Mark Yu", "M4rkyu"],
        url: SITE_URL,
        jobTitle: [
          "Software Engineer",
          "Frontend Developer",
          "Game Developer",
          "Digital Artist",
        ],
        sameAs: [
          "https://github.com/zhenxiao-yu",
          "https://dev.to/zhenxiao_yu_a87bb6b2017f1",
        ],
      },
      {
        "@type": "WebSite",
        "@id": websiteId,
        name: "M4rkyu.com",
        url: localePath,
        inLanguage: locale,
        publisher: {
          "@id": personId,
        },
      },
      {
        "@type": "CreativeWork",
        "@id": `${SITE_URL}/#portfolio`,
        name: "M4rkyu.com Portfolio",
        url: localePath,
        inLanguage: locale,
        creator: {
          "@id": personId,
        },
        isPartOf: {
          "@id": websiteId,
        },
      },
    ],
  };
}
