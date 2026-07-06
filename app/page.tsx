import HeroCarousel from "./components/HeroCarousel";
import ShareButtons from "./components/ShareButtons";
import TourPackagesGrid from "./components/tours/TourPackagesGrid";
import { listPublicHeroSlides } from "@/lib/heroSlidesApi";
import { getPublicLandingSeo } from "@/lib/seoApi";
import {
  listarTourPackages,
  resolveTourPackageImageUrl,
} from "@/lib/tourPackagesApi";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.amazonjungle-expeditions.com";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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

const getHeroSlides = async () => {
  try {
    const response = await listPublicHeroSlides();
    return response.slides;
  } catch {
    return [];
  }
};

const getLandingSeo = async () => {
  try {
    const response = await getPublicLandingSeo();
    return response.data;
  } catch {
    return null;
  }
};

const getToursForStructuredData = async () => {
  try {
    return await listarTourPackages(false, {
      cache: "force-cache",
      next: {
        revalidate: 300,
      },
    });
  } catch {
    return [];
  }
};

const buildJsonLd = ({
  landingSeo,
  tours,
}: {
  landingSeo: Awaited<ReturnType<typeof getLandingSeo>>;
  tours: Awaited<ReturnType<typeof getToursForStructuredData>>;
}) => {
  const business = landingSeo?.business;
  const metadata = landingSeo?.metadata;
  const faqs = landingSeo?.faqs || [];

  const sameAs = [
    business?.facebookUrl,
    business?.instagramUrl,
    business?.tiktokUrl,
    business?.youtubeUrl,
  ].filter(Boolean);

  const organization = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    name: business?.businessName || "Amazon Jungle Expeditions",
    legalName: business?.legalName || undefined,
    description: business?.description || metadata?.description,
    url: SITE_URL,
    logo: resolveAbsoluteUrl(business?.logoUrl),
    telephone: business?.phone,
    email: business?.email,
    sameAs: sameAs.length > 0 ? sameAs : undefined,
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
    name: business?.businessName || "Amazon Jungle Expeditions",
    url: SITE_URL,
    description: metadata?.description,
  };

  const itemList =
    tours.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Amazon Jungle Expeditions tours from Iquitos",
          itemListElement: tours.map((tour, index) => ({
            "@type": "ListItem",
            position: index + 1,
            item: {
              "@type": "TouristTrip",
              name: tour.bottomTitle || tour.overlayTitle,
              description:
                tour.longDescription || tour.excerpt || tour.bottomDescription || tour.overlayTitle,
              image: resolveAbsoluteUrl(resolveTourPackageImageUrl(tour.imageWebpUrl)),
              touristType: tour.location || "Amazon rainforest tour",
              offers:
                tour.priceAmount || tour.price
                  ? {
                      "@type": "Offer",
                      price: tour.priceAmount || undefined,
                      priceCurrency: tour.priceCurrency || "USD",
                      description: tour.price,
                      availability: "https://schema.org/InStock",
                      url: SITE_URL,
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

  return [organization, website, itemList, faqPage].filter(Boolean);
};

const Home = async () => {
  const [slides, landingSeo, tours] = await Promise.all([
    getHeroSlides(),
    getLandingSeo(),
    getToursForStructuredData(),
  ]);

  const jsonLd = buildJsonLd({ landingSeo, tours });
  const faqs = landingSeo?.faqs || [];
  const shareMessage = landingSeo?.metadata?.shareMessage || undefined;

  return (
    <main className="w-full bg-stone-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      {jsonLd.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}

      <HeroCarousel initialSlides={slides} />

      <TourPackagesGrid />

      {faqs.length > 0 ? (
        <section id="faq" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700 dark:text-emerald-400">
              Frequently asked questions
            </p>
            <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl">
              Plan your Amazon experience with confidence
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

      <section id="contact" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700 dark:text-emerald-400">
              Amazon Jungle Expeditions
            </p>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
              Experience the Amazon from Iquitos
            </h1>

            <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
              Discover the rainforest through guided excursions, authentic
              experiences, living nature and local hospitality from our jungle
              lodge.
            </p>
          </div>

          <div className="space-y-5">
            <ShareButtons message={shareMessage} url={SITE_URL} />
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
