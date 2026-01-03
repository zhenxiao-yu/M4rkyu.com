import React from "react";
import { Helmet } from "react-helmet";

const SITE_URL = "https://m4rkyu.com";
const DEFAULT_IMAGE = `${SITE_URL}/logo512.png`;
const sameAsProfiles = [
  "https://www.linkedin.com/in/zhenxiao-yu-a586a2211/",
  "https://github.com/zhenxiao-yu",
  "https://www.instagram.com/m4rkyu/",
  "https://www.facebook.com/mark.yu.3762584",
  "https://www.youtube.com/channel/UCUY09EUdbMoyDeWrMBYcUZQ",
  "https://open.spotify.com/user/317xma3mkahx2sgwksrv72bvlywm?si=d87d26fee3e84210"
];

const buildBreadcrumbList = (breadcrumbs = []) => {
  if (!breadcrumbs.length) return undefined;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`
    }))
  };
};

const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "ZhenXiao (Mark) Yu",
  alternateName: ["Mark Yu", "Zhenxiao Yu", "Zhenxiao (Mark) Yu"],
  url: SITE_URL,
  jobTitle: "Software Engineer",
  sameAs: sameAsProfiles,
  knowsLanguage: ["English", "Mandarin"],
  alumniOf: {
    "@type": "CollegeOrUniversity",
    name: "Western University"
  },
  homeLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressCountry: "CA",
      addressRegion: "Ontario"
    }
  }
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  url: SITE_URL,
  name: "M4rkyu",
  alternateName: "M4rkyu Studio",
  logo: `${SITE_URL}/logo512.png`,
  sameAs: sameAsProfiles
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "M4rkyu Portfolio",
  url: SITE_URL,
  alternateName: ["ZhenXiao Yu Portfolio", "Mark Yu Portfolio"],
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/?s={search_term_string}`,
    "query-input": "required name=search_term_string"
  }
};

const Seo = ({
  title = "M4rkyu.com",
  description = "Official website of Zhenxiao (Mark) Yu - software engineer, artist, and game developer.",
  path = "/",
  image = DEFAULT_IMAGE,
  type = "website",
  breadcrumbs = [],
  includePerson = false,
  additionalSchemas = [],
  keywords = "Mark Yu, Zhenxiao Yu, software engineer, developer, portfolio"
}) => {
  const canonicalUrl = `${SITE_URL}${path}`;

  const breadcrumbSchema = buildBreadcrumbList(breadcrumbs);
  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    url: canonicalUrl,
    description,
    breadcrumb: breadcrumbSchema?.itemListElement
      ? {
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbSchema.itemListElement
        }
      : undefined
  };

  const structuredData = [websiteSchema, webPageSchema, breadcrumbSchema, includePerson ? personSchema : null, includePerson ? organizationSchema : null, ...additionalSchemas].filter(Boolean);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="M4rkyu" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:creator" content="@m4rkyu" />

      {structuredData.map((schema, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;
export { SITE_URL, DEFAULT_IMAGE, sameAsProfiles };
