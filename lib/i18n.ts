export const LOCALES = ["en", "es"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const isLocale = (value: unknown): value is Locale => {
  return typeof value === "string" && LOCALES.includes(value as Locale);
};

export const getLocale = (value: unknown): Locale => {
  return isLocale(value) ? value : DEFAULT_LOCALE;
};

export const localeLabels: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

export const alternateLocale = (locale: Locale): Locale =>
  locale === "en" ? "es" : "en";

export const copy = {
  en: {
    htmlLang: "en",
    switchTo: "Español",
    faqEyebrow: "Frequently asked questions",
    faqTitle: "Plan your Amazon experience with confidence",
    contactEyebrow: "Amazon Jungle Expeditions",
    contactTitle: "Experience the Amazon from Iquitos",
    contactDescription:
      "Discover the rainforest through guided excursions, authentic experiences, living nature and local hospitality from our jungle lodge.",
    toursEyebrow: "Amazon Jungle Expeditions",
    toursTitle: "Choose your Amazon experience",
    toursDescription:
      "Guided tours and lodge-based rainforest experiences from Iquitos, designed for travelers looking for nature, culture and authentic Amazonian hospitality.",
    shareTitle: "Share this experience",
    shareDescription:
      "Invite friends and travelers to discover the Amazon from Iquitos.",
    defaultShareMessage:
      "Discover Amazon Jungle Expeditions: authentic rainforest experiences departing from Iquitos, Peru.",
    reserveWhatsapp: "Reserve on WhatsApp",
    intranet: "Corporate intranet",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    carouselLabel: "Main carousel",
    previousSlide: "Previous carousel image",
    nextSlide: "Next carousel image",
    goToSlide: "Go to slide",
  },
  es: {
    htmlLang: "es-PE",
    switchTo: "English",
    faqEyebrow: "Preguntas frecuentes",
    faqTitle: "Planifica tu experiencia amazónica con confianza",
    contactEyebrow: "Amazon Jungle Expeditions",
    contactTitle: "Vive la Amazonía desde Iquitos",
    contactDescription:
      "Descubre la selva con excursiones guiadas, experiencias auténticas, naturaleza viva y hospitalidad local desde nuestro albergue amazónico.",
    toursEyebrow: "Amazon Jungle Expeditions",
    toursTitle: "Elige tu experiencia amazónica",
    toursDescription:
      "Tours guiados y experiencias en albergue desde Iquitos para viajeros que buscan naturaleza, cultura y hospitalidad amazónica auténtica.",
    shareTitle: "Comparte esta experiencia",
    shareDescription:
      "Invita a tus amigos y viajeros a descubrir la Amazonía desde Iquitos.",
    defaultShareMessage:
      "Descubre Amazon Jungle Expeditions: experiencias auténticas en la selva amazónica desde Iquitos, Perú.",
    reserveWhatsapp: "Reservar por WhatsApp",
    intranet: "Intranet corporativa",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    carouselLabel: "Carrusel principal",
    previousSlide: "Imagen anterior del carrusel",
    nextSlide: "Siguiente imagen del carrusel",
    goToSlide: "Ir al slide",
  },
} as const;

export const buildLocalizedPath = (locale: Locale, pathname = "/") => {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length > 0 && isLocale(segments[0])) {
    segments[0] = locale;
  } else {
    segments.unshift(locale);
  }

  return `/${segments.join("/")}`;
};
