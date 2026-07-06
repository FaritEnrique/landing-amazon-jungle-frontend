import type { MetadataRoute } from "next";

const FALLBACK_SITE_URL = "https://landing.amazonjungle-expeditions.com";

const getSiteUrl = () => {
  return (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL).replace(
    /\/$/,
    "",
  );
};

const robots = (): MetadataRoute.Robots => {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/login",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
};

export default robots;