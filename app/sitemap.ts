import type { MetadataRoute } from "next";

const FALLBACK_SITE_URL = "https://landing.amazonjungle-expeditions.com";

const getSiteUrl = () => {
  return (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL).replace(
    /\/$/,
    "",
  );
};

const sitemap = (): MetadataRoute.Sitemap => {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();

  return [
    {
      url: `${siteUrl}/en`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          en: `${siteUrl}/en`,
          "es-PE": `${siteUrl}/es`,
        },
      },
    },
    {
      url: `${siteUrl}/es`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.95,
      alternates: {
        languages: {
          en: `${siteUrl}/en`,
          "es-PE": `${siteUrl}/es`,
        },
      },
    },
  ];
};

export default sitemap;
