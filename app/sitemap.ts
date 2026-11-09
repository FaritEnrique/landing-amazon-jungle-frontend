import type { MetadataRoute } from "next";
import { getFaqLanguageAlternates } from "@/lib/faqRoutes";
import { getPublicLandingSeo } from "@/lib/seoApi";
import type { Locale } from "@/lib/i18n";

const FALLBACK_SITE_URL = "https://landing.amazonjungle-expeditions.com";

// Generate at request time; public API fetches cache successful data for 120s.
export const dynamic = "force-dynamic";

const getSiteUrl = () =>
  (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_SITE_URL).replace(/\/$/, "");

const getHomeLanguageAlternates = (siteUrl: string) => ({
  en: `${siteUrl}/en`,
  "es-PE": `${siteUrl}/es`,
  "x-default": `${siteUrl}/en`,
});

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const siteUrl = getSiteUrl();
  // Errors must not be confused with an empty FAQ collection.
  const locales: Locale[] = ["en", "es"];
  const [en, es] = await Promise.all(
    locales.map(async (locale) => (await getPublicLandingSeo(locale)).data),
  );
  const homeAlternates = { languages: getHomeLanguageAlternates(siteUrl) };
  const result: MetadataRoute.Sitemap = [];
  if (en.metadata.robotsIndex) {
    result.push({ url: `${siteUrl}/en`, changeFrequency: "weekly", priority: 1, alternates: homeAlternates });
  }
  if (es.metadata.robotsIndex) {
    result.push({ url: `${siteUrl}/es`, changeFrequency: "weekly", priority: 0.8, alternates: homeAlternates });
  }
  const faqAlternates = { languages: getFaqLanguageAlternates(siteUrl) };
  const faqs = [
    en.faqs.length > 0 && en.metadata.robotsIndex,
    es.faqs.length > 0 && es.metadata.robotsIndex,
  ];
  if (faqs[0]) {
    result.push({
      url: `${siteUrl}/en/faqs`,
      changeFrequency: "monthly",
      priority: 0.65,
      alternates: faqs[1] ? faqAlternates : undefined,
    });
  }
  if (faqs[1]) {
    result.push({
      url: `${siteUrl}/es/preguntas-frecuentes`,
      changeFrequency: "monthly",
      priority: 0.65,
      alternates: faqs[0] ? faqAlternates : undefined,
    });
  }
  return result;
};

export default sitemap;
