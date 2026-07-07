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
import LanguageSwitcher from "./components/LanguageSwitcher";
import HtmlLangSync from "./components/HtmlLangSync";

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

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://landing.amazonjungle-expeditions.com"
).replace(/\/$/, "");

export const metadata: Metadata = {
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
  },
  twitter: {
    card: "summary_large_image",
    title: "Amazon Jungle Expeditions",
    description:
      "Guided Amazon rainforest tours and jungle lodge experiences from Iquitos, Peru.",
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
      lang="en"
      className={`${montserrat.variable} ${playfair.variable} ${greatVibes.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden font-sans">
        <HtmlLangSync />
        <Header />

        <AppToaster />

        <main className="grow w-full">{children}</main>

        <Footer />
        <LanguageSwitcher />
      </body>
    </html>
  );
};

export default RootLayout;
