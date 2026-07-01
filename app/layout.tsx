import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Great_Vibes } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";
import AppToaster from "./components/AppToaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const greatVibes = Great_Vibes({
  weight: "400",
  variable: "--font-great-vibes",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Amazon Jungle Expeditions",
  description: "Landing Page para promocionar paquetes turísticos",
};

export const viewport: Viewport = {
  themeColor: "#1e3a8a",
};

// 💡 Convertido a Arrow Function para respetar el estándar estricto del proyecto
const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${greatVibes.variable} h-full antialiased`}
    >
      <body className={`${greatVibes.className} min-h-full flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden`}>
        {/* Header institucional */}
        <Header />

        <AppToaster />

        {/* Contenedor dinámico para las páginas del sistema */}
        <main className="flex-grow w-full">
          {children}
        </main>

        {/* Footer de auditoría */}
        <Footer />
      </body>
    </html>
  );
};

export default RootLayout;