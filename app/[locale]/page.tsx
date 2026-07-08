import type { Metadata } from "next";
import HeroCarousel from "../components/HeroCarousel";
import ShareButtons from "../components/ShareButtons";
import TourPackagesGrid from "../components/tours/TourPackagesGrid";
import { listPublicHeroSlides } from "@/lib/heroSlidesApi";
import { copy, getLocale, type Locale } from "@/lib/i18n";
import { getPublicLandingSeo } from "@/lib/seoApi";
import {
  listarTourPackages,
  resolveTourPackageImageUrl,
} from "@/lib/tourPackagesApi";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://landing.amazonjungle-expeditions.com"
).replace(/\/$/, "");
const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"
).replace(/\/$/, "");
const MAIN_SITE_URL = (
  process.env.NEXT_PUBLIC_MAIN_SITE_URL ||
  "https://www.amazonjungle-expeditions.com"
).replace(/\/$/, "");
const DEFAULT_LOGO_IMAGE = "/images/logos/Logo-sbg.webp";
const DEFAULT_SOCIAL_IMAGE = "/images/og/amazon-jungle-expeditions-og.webp";

const getLocalizedSiteUrl = (locale: Locale) => `${SITE_URL}/${locale}`;

const resolveAbsoluteUrl = (url?: string | null) => {
  if (!url) return undefined;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/uploads/")) {
    return `${API_URL}${url}`;
  }

  if (url.startsWith("/")) {
    return `${SITE_URL}${url}`;
  }

  return url;
};

const getHeroSlides = async (locale: Locale) => {
  try {
    const response = await listPublicHeroSlides(locale);
    return response.slides;
  } catch {
    return [];
  }
};

const getLandingSeo = async (locale: Locale) => {
  try {
    const response = await getPublicLandingSeo(locale);
    return response.data;
  } catch {
    return null;
  }
};

const getToursForStructuredData = async (locale: Locale) => {
  try {
    return await listarTourPackages(
      false,
      {
        cache: "force-cache",
        next: {
          revalidate: 300,
        },
      },
      locale,
    );
  } catch {
    return [];
  }
};

const buildJsonLd = ({
  landingSeo,
  tours,
  locale,
}: {
  landingSeo: Awaited<ReturnType<typeof getLandingSeo>>;
  tours: Awaited<ReturnType<typeof getToursForStructuredData>>;
  locale: Locale;
}) => {
  const localizedUrl = getLocalizedSiteUrl(locale);
  const language = locale === "es" ? "es-PE" : "en";
  const business = landingSeo?.business;
  const metadata = landingSeo?.metadata;
  const faqs = landingSeo?.faqs || [];
  const organizationId = `${MAIN_SITE_URL}/#organization`;
  const websiteId = `${MAIN_SITE_URL}/#website`;
  const webpageId = `${localizedUrl}#webpage`;
  const logoUrl =
    resolveAbsoluteUrl(business?.logoUrl) || resolveAbsoluteUrl(DEFAULT_LOGO_IMAGE);
  const primaryImageUrl =
    resolveAbsoluteUrl(metadata?.ogImageUrl) ||
    resolveAbsoluteUrl(DEFAULT_SOCIAL_IMAGE);

  const sameAs = [
    business?.facebookUrl,
    business?.instagramUrl,
    business?.tiktokUrl,
    business?.youtubeUrl,
  ].filter(Boolean);

  const organization = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "@id": organizationId,
    name: business?.businessName || "Amazon Jungle Expeditions",
    legalName: business?.legalName || undefined,
    description: business?.description || metadata?.description,
    url: MAIN_SITE_URL,
    logo: logoUrl,
    image: primaryImageUrl,
    telephone: business?.phone,
    email: business?.email,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
    contactPoint: business?.phone
      ? {
          "@type": "ContactPoint",
          telephone: business.phone,
          contactType: "reservations",
          areaServed: ["PE", "US"],
          availableLanguage: ["English", "Spanish"],
        }
      : undefined,
    address: business?.address
      ? {
          "@type": "PostalAddress",
          streetAddress: business.address,
          addressLocality: business.city || "Iquitos",
          addressRegion: business.region || "Loreto",
          addressCountry: business.country || "PE",
        }
      : undefined,
    geo:
      business?.latitude && business?.longitude
        ? {
            "@type": "GeoCoordinates",
            latitude: business.latitude,
            longitude: business.longitude,
          }
        : undefined,
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": websiteId,
    name: business?.businessName || "Amazon Jungle Expeditions",
    url: MAIN_SITE_URL,
    description: metadata?.description,
    publisher: {
      "@id": organizationId,
    },
    inLanguage: ["en", "es-PE"],
  };

  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": webpageId,
    url: localizedUrl,
    name: metadata?.title || business?.businessName || "Amazon Jungle Expeditions",
    description: metadata?.description || business?.description,
    inLanguage: language,
    isPartOf: {
      "@id": websiteId,
    },
    publisher: {
      "@id": organizationId,
    },
    about: {
      "@id": organizationId,
    },
    primaryImageOfPage: primaryImageUrl
      ? {
          "@type": "ImageObject",
          url: primaryImageUrl,
          width: 1200,
          height: 630,
        }
      : undefined,
  };

  const itemList =
    tours.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          "@id": `${localizedUrl}#tour-packages`,
          name: copy[locale].toursTitle,
          url: `${localizedUrl}#excursions`,
          inLanguage: language,
          isPartOf: {
            "@id": webpageId,
          },
          itemListElement: tours.map((tour, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "TouristTrip",
              "@id": `${localizedUrl}#tour-${tour.id}`,
              name: tour.bottomTitle || tour.overlayTitle,
              description:
                tour.longDescription ||
                tour.excerpt ||
                tour.bottomDescription ||
                tour.overlayTitle,
              image: resolveAbsoluteUrl(
                resolveTourPackageImageUrl(tour.imageWebpUrl),
              ),
              touristType: tour.location || "Amazon rainforest tour",
              provider: {
                "@id": organizationId,
              },
              offers:
                tour.priceAmount || tour.price
                  ? {
                      "@type": "Offer",
                      price: tour.priceAmount || undefined,
                      priceCurrency: tour.priceCurrency || "USD",
                      description: tour.price,
                      availability: "https://schema.org/InStock",
                      url: tour.buttonHref
                        ? resolveAbsoluteUrl(tour.buttonHref) || localizedUrl
                        : localizedUrl,
                    }
                  : undefined,
            },
          })),
        }
      : null;

  const faqPage =
    faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          "@id": `${localizedUrl}#faq`,
          url: `${localizedUrl}#faq`,
          inLanguage: language,
          isPartOf: {
            "@id": webpageId,
          },
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        }
      : null;

  return [organization, website, webPage, itemList, faqPage].filter(Boolean);
};

export const generateStaticParams = () => [{ locale: "en" }, { locale: "es" }];

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const landingSeo = await getLandingSeo(locale);
  const metadata = landingSeo?.metadata;
  const localizedUrl = getLocalizedSiteUrl(locale);
  const ogImage =
    resolveAbsoluteUrl(metadata?.ogImageUrl) ||
    resolveAbsoluteUrl(DEFAULT_SOCIAL_IMAGE);
  const twitterImage =
    resolveAbsoluteUrl(metadata?.twitterImageUrl || metadata?.ogImageUrl) ||
    resolveAbsoluteUrl(DEFAULT_SOCIAL_IMAGE);
  const metadataTitle = metadata?.title || "Amazon Jungle Expeditions";
  const metadataDescription =
    metadata?.description || copy[locale].contactDescription;

  return {
    title: metadataTitle,
    description: metadataDescription,
    alternates: {
      canonical: localizedUrl,
      languages: {
        en: `${SITE_URL}/en`,
        "es-PE": `${SITE_URL}/es`,
        "x-default": `${SITE_URL}/en`,
      },
    },
    openGraph: {
      title: metadata?.ogTitle || metadataTitle,
      description: metadata?.ogDescription || metadataDescription,
      url: localizedUrl,
      siteName:
        landingSeo?.business?.businessName || "Amazon Jungle Expeditions",
      locale: locale === "es" ? "es_PE" : "en_US",
      alternateLocale: locale === "es" ? ["en_US"] : ["es_PE"],
      type: "website",
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: metadata?.ogTitle || metadataTitle,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: metadata?.twitterTitle || metadata?.ogTitle || metadataTitle,
      description:
        metadata?.twitterDescription ||
        metadata?.ogDescription ||
        metadataDescription,
      images: twitterImage ? [twitterImage] : undefined,
    },
    robots: {
      index: metadata?.robotsIndex ?? true,
      follow: metadata?.robotsFollow ?? true,
      googleBot: {
        index: metadata?.robotsIndex ?? true,
        follow: metadata?.robotsFollow ?? true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
};

const Home = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const t = copy[locale];
  const [slides, landingSeo, tours] = await Promise.all([
    getHeroSlides(locale),
    getLandingSeo(locale),
    getToursForStructuredData(locale),
  ]);

  const jsonLd = buildJsonLd({ landingSeo, tours, locale });
  const faqs = landingSeo?.faqs || [];
  const shareMessage = landingSeo?.metadata?.shareMessage || undefined;

  return (
    <div className="w-full bg-stone-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      {jsonLd.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}

      <HeroCarousel initialSlides={slides} locale={locale} />

      <TourPackagesGrid locale={locale} initialPackages={tours} />

      {faqs.length > 0 ? (
        <section
          id="faq"
          className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700 dark:text-emerald-400">
              {t.faqEyebrow}
            </p>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              {t.faqTitle}
            </h2>
          </div>

          <div className="mx-auto mt-8 max-w-4xl space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.id}
                className="group rounded-3xl border border-emerald-900/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-900"
              >
                <summary className="cursor-pointer list-none text-base font-black text-slate-950 marker:hidden dark:text-white">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <section
        id="contact"
        className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24"
      >
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700 dark:text-emerald-400">
              {t.contactEyebrow}
            </p>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
              {t.contactTitle}
            </h2>

            <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
              {t.contactDescription}
            </p>
          </div>

          <div className="space-y-5">
            <ShareButtons
              title={t.shareTitle}
              description={t.shareDescription}
              message={shareMessage || t.defaultShareMessage}
              url={getLocalizedSiteUrl(locale)}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
