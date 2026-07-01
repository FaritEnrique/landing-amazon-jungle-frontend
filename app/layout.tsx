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

export const metadata: Metadata = {
  title: "Amazon Jungle Expeditions",
  description: "Landing Page para promocionar paquetes turísticos",
};

export const viewport: Viewport = {
  themeColor: "#1e3a8a",
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html
      lang="es"
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