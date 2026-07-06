import type { Metadata, Viewport } from "next";
import {
  Geist_Mono,
  Great_Vibes,
  Montserrat,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AppToaster from "./components/AppToaster";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const greatVibes = Great_Vibes({
  weight: "400",
  variable: "--font-great-vibes",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const normalizeBaseUrl = (url: string) => url.replace(/\/$/, "");

const API_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
);

const SITE_URL = normalizeBaseUrl(
  process.env.NEXT_PUBLIC_SITE_URL ||
    "https://landing.amazonjungle-expeditions.com",
);

const fallbackSeoMetadata = {
  title: "Amazon Jungle Expeditions | Tours en Iquitos y Amazon Tours",
  description:
    "Reserva tours en Iquitos y Amazon tours from Iquitos. Experiencias auténticas en la Amazonía peruana con lodge, excursiones guiadas, naturaleza, cultura viva y aventura.",
  keywords: [
    "Amazon Jungle Expeditions",
    "tours en Iquitos",
    "tour en Iquitos",
    "excursiones en Iquitos",
    "excursiones en la selva",
    "tours en la selva peruana",
    "tours en la Amazonía peruana",
    "albergue en Iquitos",
    "lodge en Iquitos",
    "albergue en la selva",
    "lodge en la Amazonía peruana",
    "viaje a la Amazonía peruana",
    "turismo en Iquitos",
    "selva de Iquitos",
    "Amazonas Perú",
    "Amazon tours from Iquitos",
    "Iquitos Amazon tours",
    "Iquitos jungle tours",
    "Amazon jungle tours Peru",
    "Peruvian Amazon tours",
    "Amazon rainforest tours Peru",
    "Amazon lodge Iquitos",
    "Amazon jungle lodge Peru",
    "Peru jungle lodge",
    "Amazon rainforest lodge",
    "Amazon jungle expeditions Peru",
    "jungle lodge near Iquitos",
    "rainforest tours from Iquitos",
    "Peruvian rainforest experience",
  ],
  canonicalUrl: null as string | null,
  ogTitle: null as string | null,
  ogDescription: null as string | null,
  ogImageUrl: null as string | null,
  twitterTitle: null as string | null,
  twitterDescription: null as string | null,
  twitterImageUrl: null as string | null,
  robotsIndex: true,
  robotsFollow: true,
  businessName: "Amazon Jungle Expeditions",
};

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

const getSeoMetadata = async () => {
  try {
    const response = await fetch(`${API_URL}/api/seo/meta`, {
      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      return fallbackSeoMetadata;
    }

    const data = (await response.json()) as {
      ok?: boolean;
      data?: {
        title?: string;
        description?: string;
        keywords?: string[];
        canonicalUrl?: string | null;
        ogTitle?: string | null;
        ogDescription?: string | null;
        ogImageUrl?: string | null;
        twitterTitle?: string | null;
        twitterDescription?: string | null;
        twitterImageUrl?: string | null;
        robotsIndex?: boolean;
        robotsFollow?: boolean;
        business?: {
          businessName?: string;
        };
      };
    };

    return {
      title: data.data?.title || fallbackSeoMetadata.title,
      description: data.data?.description || fallbackSeoMetadata.description,
      keywords:
        data.data?.keywords && data.data.keywords.length > 0
          ? data.data.keywords
          : fallbackSeoMetadata.keywords,
      canonicalUrl: data.data?.canonicalUrl || fallbackSeoMetadata.canonicalUrl,
      ogTitle: data.data?.ogTitle || fallbackSeoMetadata.ogTitle,
      ogDescription:
        data.data?.ogDescription || fallbackSeoMetadata.ogDescription,
      ogImageUrl: data.data?.ogImageUrl || fallbackSeoMetadata.ogImageUrl,
      twitterTitle: data.data?.twitterTitle || fallbackSeoMetadata.twitterTitle,
      twitterDescription:
        data.data?.twitterDescription || fallbackSeoMetadata.twitterDescription,
      twitterImageUrl:
        data.data?.twitterImageUrl || fallbackSeoMetadata.twitterImageUrl,
      robotsIndex: data.data?.robotsIndex ?? fallbackSeoMetadata.robotsIndex,
      robotsFollow: data.data?.robotsFollow ?? fallbackSeoMetadata.robotsFollow,
      businessName:
        data.data?.business?.businessName || "Amazon Jungle Expeditions",
    };
  } catch {
    return fallbackSeoMetadata;
  }
};

export const generateMetadata = async (): Promise<Metadata> => {
  const seo = await getSeoMetadata();

  const ogImage = resolveAbsoluteUrl(seo.ogImageUrl);
  const twitterImage = resolveAbsoluteUrl(
    seo.twitterImageUrl || seo.ogImageUrl,
  );
  const canonicalUrl = resolveAbsoluteUrl(seo.canonicalUrl) || SITE_URL;

  return {
    metadataBase: new URL(SITE_URL),
    applicationName: "Amazon Jungle Expeditions",
    creator: "Amazon Jungle Expeditions",
    publisher: seo.businessName || "Amazon Jungle Expeditions",
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: seo.ogTitle || seo.title,
      description: seo.ogDescription || seo.description,
      url: canonicalUrl,
      siteName: seo.businessName || "Amazon Jungle Expeditions",
      locale: "es_PE",
      type: "website",
      images: ogImage
        ? [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: seo.ogTitle || seo.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: seo.twitterTitle || seo.ogTitle || seo.title,
      description:
        seo.twitterDescription || seo.ogDescription || seo.description,
      images: twitterImage ? [twitterImage] : undefined,
    },
    robots: {
      index: seo.robotsIndex,
      follow: seo.robotsFollow,
    },
  };
};

export const viewport: Viewport = {
  themeColor: "#065f46",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html
      lang="es-PE"
      className={`${montserrat.variable} ${playfair.variable} ${greatVibes.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden font-sans">
        <Header />

        <AppToaster />

        <main className="grow w-full">{children}</main>

        <Footer />
      </body>
    </html>
  );
};

export default RootLayout;
