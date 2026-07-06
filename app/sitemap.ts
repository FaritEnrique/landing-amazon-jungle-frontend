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

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
};

export default sitemap;