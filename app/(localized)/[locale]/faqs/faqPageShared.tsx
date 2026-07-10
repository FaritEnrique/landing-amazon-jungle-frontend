import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle, ArrowLeft, HelpCircle } from "lucide-react";
import MarkdownContent from "@/app/components/faqs/MarkdownContent";
import { copy, type Locale } from "@/lib/i18n";
import { getFaqLanguageAlternates, getFaqPath } from "@/lib/faqRoutes";
import { getJsonLdKey, serializeJsonLd } from "@/lib/jsonLd";
import { stripMarkdown } from "@/lib/markdown";
import { getPublicLandingSeo, type SeoFaq } from "@/lib/seoApi";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://landing.amazonjungle-expeditions.com"
).replace(/\/$/, "");
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(
  /\/$/,
  "",
);
const DEFAULT_SOCIAL_IMAGE = "/images/og/amazon-jungle-expeditions-og.webp";
const WHATSAPP_URL = "https://wa.me/51943214093";

const resolveAbsoluteUrl = (url?: string | null) => {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/uploads/")) return `${API_URL}${url}`;
  if (url.startsWith("/")) return `${SITE_URL}${url}`;
  return url;
};

const resolveSocialImageUrl = (imageUrl?: string | null) => {
  return resolveAbsoluteUrl(imageUrl) || resolveAbsoluteUrl(DEFAULT_SOCIAL_IMAGE);
};

const getFaqPageTitle = (locale: Locale) =>
  locale === "es"
    ? "Preguntas frecuentes sobre tours en la Amazonía desde Iquitos"
    : "Frequently Asked Questions about Amazon Jungle Tours from Iquitos";

const getFaqPageDescription = (locale: Locale) =>
  locale === "es"
    ? "Resuelve dudas sobre seguridad, clima, qué llevar, reservas, alojamiento y tours en la selva amazónica desde Iquitos, Perú."
    : "Find answers about safety, weather, what to pack, booking, lodge stays and Amazon rainforest tours from Iquitos, Peru.";

const getLandingSeo = async (locale: Locale) => {
  try {
    const response = await getPublicLandingSeo(locale);
    return response.data;
  } catch {
    return null;
  }
};

const buildFaqJsonLd = ({
  faqs,
  locale,
}: {
  faqs: SeoFaq[];
  locale: Locale;
}) => {
  const faqUrl = `${SITE_URL}${getFaqPath(locale)}`;
  const homeUrl = `${SITE_URL}/${locale}`;
  const language = locale === "es" ? "es-PE" : "en";

  const faqPage = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${faqUrl}#faqpage`,
    url: faqUrl,
    name: getFaqPageTitle(locale),
    description: getFaqPageDescription(locale),
    inLanguage: language,
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: stripMarkdown(faq.answer),
      },
    })),
  };

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${faqUrl}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "es" ? "Inicio" : "Home",
        item: homeUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "es" ? "Preguntas frecuentes" : "FAQs",
        item: faqUrl,
      },
    ],
  };

  return faqs.length > 0 ? [faqPage, breadcrumbList] : [breadcrumbList];
};

export const buildFaqMetadata = async (locale: Locale): Promise<Metadata> => {
  const landingSeo = await getLandingSeo(locale);
  const metadata = landingSeo?.metadata;
  const faqUrl = `${SITE_URL}${getFaqPath(locale)}`;
  const title = getFaqPageTitle(locale);
  const description = getFaqPageDescription(locale);
  const image = resolveSocialImageUrl(metadata?.ogImageUrl);

  return {
    title,
    description,
    alternates: {
      canonical: faqUrl,
      languages: getFaqLanguageAlternates(SITE_URL),
    },
    openGraph: {
      title,
      description,
      url: faqUrl,
      siteName: landingSeo?.business?.businessName || "Amazon Jungle Expeditions",
      locale: locale === "es" ? "es_PE" : "en_US",
      alternateLocale: locale === "es" ? ["en_US"] : ["es_PE"],
      type: "article",
      images: image
        ? [
            {
              url: image,
              width: 1200,
              height: 630,
              alt: title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
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

const getFaqIntro = (locale: Locale) => {
  if (locale === "es") {
    return {
      eyebrow: "Centro de ayuda",
      title: "Preguntas frecuentes",
      description:
        "Resuelve dudas sobre seguridad, clima, qué llevar, reservas, alojamiento y actividades antes de vivir tu experiencia en la Amazonía peruana.",
      backLabel: "Volver a la landing",
      whatsappTitle: "¿No encontraste tu respuesta?",
      whatsappText:
        "Escríbenos por WhatsApp y te ayudamos a elegir el tour ideal según tus días disponibles.",
      whatsappButton: "Hablar por WhatsApp",
      emptyTitle: "Aún no hay preguntas frecuentes publicadas",
      emptyText:
        "Cuando el equipo publique nuevas preguntas desde el dashboard, aparecerán aquí automáticamente.",
      showAnswer: "Ver respuesta +",
      hideAnswer: "Ocultar respuesta −",
    };
  }

  return {
    eyebrow: "Help center",
    title: "Frequently asked questions",
    description:
      "Find answers about safety, weather, what to pack, booking, lodge stays and activities before your Peruvian Amazon experience.",
    backLabel: "Back to landing page",
    whatsappTitle: "Didn’t find your answer?",
    whatsappText:
      "Message us on WhatsApp and we will help you choose the right tour based on your available days.",
    whatsappButton: "Chat on WhatsApp",
    emptyTitle: "No FAQs have been published yet",
    emptyText:
      "When the team publishes new questions from the dashboard, they will appear here automatically.",
    showAnswer: "View answer +",
    hideAnswer: "Hide answer −",
  };
};

interface FaqPublicPageProps {
  locale: Locale;
}

const FaqPublicPage = async ({ locale }: FaqPublicPageProps) => {
  const landingSeo = await getLandingSeo(locale);
  const faqs = landingSeo?.faqs || [];
  const text = getFaqIntro(locale);
  const t = copy[locale];
  const jsonLd = buildFaqJsonLd({ faqs, locale });
  const homePath = `/${locale}`;

  return (
    <main className="min-h-screen bg-stone-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      {jsonLd.map((item) => (
        <script
          key={getJsonLdKey(item, "faq-jsonld")}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(item) }}
        />
      ))}
      <section className="relative overflow-hidden border-b border-emerald-900/10 bg-gradient-to-br from-emerald-950 via-emerald-900 to-lime-900 px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-20">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_top_left,white,transparent_32rem)]" />
        <div className="relative mx-auto max-w-7xl">
          <Link
            href={homePath}
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-50 backdrop-blur transition hover:bg-white/20"
          >
            <ArrowLeft size={15} />
            {text.backLabel}
          </Link>

          <div className="mt-10 max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-100">
              {text.eyebrow}
            </p>
            <h1 className="mt-4 font-display text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
              {text.title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-emerald-50/90 sm:text-lg">
              {text.description}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:px-8 lg:py-16">
        <div className="rounded-[2rem] border border-emerald-900/10 bg-white p-4 shadow-xl shadow-emerald-950/5 dark:border-white/10 dark:bg-slate-900 sm:p-6 lg:p-8">
          {faqs.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
              <HelpCircle className="mx-auto h-10 w-10 text-emerald-700 dark:text-emerald-300" />
              <h2 className="mt-4 text-xl font-black text-slate-950 dark:text-white">
                {text.emptyTitle}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600 dark:text-slate-300">
                {text.emptyText}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {faqs.map((faq, index) => (
                <details key={faq.id} className="group py-5 first:pt-0 last:pb-0">
                  <summary className="grid cursor-pointer list-none gap-4 marker:hidden sm:grid-cols-[72px_minmax(0,1fr)_auto] sm:items-center">
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-sm font-black text-emerald-900 ring-1 ring-emerald-900/10 dark:bg-emerald-950 dark:text-emerald-100 dark:ring-white/10 sm:h-14 sm:w-14">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="text-base font-black leading-7 text-slate-950 transition group-hover:text-emerald-900 dark:text-white dark:group-hover:text-emerald-200 sm:text-lg">
                      {faq.question}
                    </span>
                    <span className="inline-flex w-fit items-center justify-center rounded-full border border-emerald-900/10 px-4 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-900 transition group-hover:bg-emerald-900 group-hover:text-white dark:border-white/10 dark:text-emerald-200 dark:group-hover:bg-emerald-300 dark:group-hover:text-emerald-950">
                      <span className="group-open:hidden">{text.showAnswer}</span>
                      <span className="hidden group-open:inline">{text.hideAnswer}</span>
                    </span>
                  </summary>

                  <div className="mt-5 rounded-3xl bg-slate-50 p-5 dark:bg-slate-950 sm:ml-[72px] sm:p-6">
                    <MarkdownContent content={faq.answer} />
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>

        <aside className="h-fit rounded-[2rem] border border-emerald-900/10 bg-gradient-to-br from-white to-emerald-50 p-6 shadow-xl shadow-emerald-950/5 dark:border-white/10 dark:from-slate-900 dark:to-emerald-950/30 lg:sticky lg:top-32">
          <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
            {t.contactEyebrow}
          </p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            {text.whatsappTitle}
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
            {text.whatsappText}
          </p>
          <Link
            href={WHATSAPP_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-800"
          >
            <MessageCircle size={17} />
            {text.whatsappButton}
          </Link>
          <Link
            href={homePath}
            className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-emerald-900/10 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-emerald-900 transition hover:bg-white dark:border-white/10 dark:text-emerald-200 dark:hover:bg-slate-900"
          >
            {text.backLabel}
          </Link>
        </aside>
      </section>
    </main>
  );
};

export default FaqPublicPage;
