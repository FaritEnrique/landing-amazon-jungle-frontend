import type { Locale } from "@/lib/i18n";

export const getFaqPath = (locale: Locale) =>
  locale === "es" ? "/es/preguntas-frecuentes" : "/en/faqs";

export const getFaqLanguageAlternates = (siteUrl: string) => ({
  en: `${siteUrl}/en/faqs`,
  "es-PE": `${siteUrl}/es/preguntas-frecuentes`,
  "x-default": `${siteUrl}/en/faqs`,
});
