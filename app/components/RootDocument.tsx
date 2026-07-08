import type { ReactNode } from "react";
import {
  Geist_Mono,
  Great_Vibes,
  Montserrat,
  Playfair_Display,
} from "next/font/google";
import Header from "./Header";
import Footer from "./Footer";
import AppToaster from "./AppToaster";
import LanguageSwitcher from "./LanguageSwitcher";
import HtmlLangSync from "./HtmlLangSync";
import AnalyticsScripts from "./AnalyticsScripts";

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

type RootDocumentProps = Readonly<{
  children: ReactNode;
  lang: "en" | "es-PE";
}>;

const RootDocument = ({ children, lang }: RootDocumentProps) => {
  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${montserrat.variable} ${playfair.variable} ${greatVibes.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden font-sans">
        <AnalyticsScripts />
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

export default RootDocument;
