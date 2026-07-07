import type { MetadataRoute } from "next";

const FALLBACK_SITE_URL = "https://landing.amazonjungle-expeditions.com";

const getSiteUrl = () => {
  return (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL).replace(
    /\/$/,
    "",
  );
};

const getLanguageAlternates = (siteUrl: string) => ({
  en: `${siteUrl}/en`,
  "es-PE": `${siteUrl}/es`,
  "x-default": `${siteUrl}/en`,
});

const sitemap = (): MetadataRoute.Sitemap => {
  const siteUrl = getSiteUrl();
  const lastModified = new Date();
  const alternates = {
    languages: getLanguageAlternates(siteUrl),
  };

  return [
    {
      url: `${siteUrl}/en`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates,
    },
    {
      url: `${siteUrl}/es`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates,
    },
  ];
};

export default sitemap;