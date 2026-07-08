import type { ReactNode } from "react";
import "../../globals.css";
import RootDocument from "../../components/RootDocument";
import { rootMetadata, rootViewport } from "../../rootMetadata";
import { getLocale } from "@/lib/i18n";

export const metadata = rootMetadata;
export const viewport = rootViewport;

const LocalizedRootLayout = async ({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) => {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  const htmlLang = locale === "es" ? "es-PE" : "en";

  return <RootDocument lang={htmlLang}>{children}</RootDocument>;
};

export default LocalizedRootLayout;
