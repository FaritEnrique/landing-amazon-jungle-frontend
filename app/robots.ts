import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.amazonjungle-expeditions.com";

const robots = (): MetadataRoute.Robots => {
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
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
};

export default robots;
