import type { Metadata, Viewport } from "next";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://landing.amazonjungle-expeditions.com"
).replace(/\/$/, "");

const DEFAULT_SOCIAL_IMAGE = `${SITE_URL}/images/og/amazon-jungle-expeditions-og.webp`;

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Amazon Jungle Expeditions",
  creator: "Amazon Jungle Expeditions",
  publisher: "Amazon Jungle Expeditions",
  title: {
    default: "Amazon Jungle Expeditions",
    template: "%s | Amazon Jungle Expeditions",
  },
  description:
    "Amazon Jungle Expeditions offers guided Amazon rainforest tours and jungle lodge experiences from Iquitos, Peru.",
  alternates: {
    canonical: `${SITE_URL}/en`,
    languages: {
      en: `${SITE_URL}/en`,
      "es-PE": `${SITE_URL}/es`,
      "x-default": `${SITE_URL}/en`,
    },
  },
  openGraph: {
    title: "Amazon Jungle Expeditions",
    description:
      "Guided Amazon rainforest tours and jungle lodge experiences from Iquitos, Peru.",
    url: `${SITE_URL}/en`,
    siteName: "Amazon Jungle Expeditions",
    locale: "en_US",
    alternateLocale: ["es_PE"],
    type: "website",
    images: [
      {
        url: DEFAULT_SOCIAL_IMAGE,
        width: 1200,
        height: 630,
        alt: "Amazon Jungle Expeditions rainforest tours from Iquitos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Amazon Jungle Expeditions",
    description:
      "Guided Amazon rainforest tours and jungle lodge experiences from Iquitos, Peru.",
    images: [DEFAULT_SOCIAL_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const rootViewport: Viewport = {
  themeColor: "#065f46",
};
