import { redirect } from "next/navigation";
import { getLocale } from "@/lib/i18n";
import { getFaqPath } from "@/lib/faqRoutes";
import FaqPublicPage, { buildFaqMetadata } from "./faqPageShared";

export const generateStaticParams = () => [{ locale: "en" }, { locale: "es" }];

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);
  return buildFaqMetadata(locale);
};

const FaqsRoute = async ({ params }: { params: Promise<{ locale: string }> }) => {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);

  if (locale === "es") {
    redirect(getFaqPath(locale));
  }

  return <FaqPublicPage locale={locale} />;
};

export default FaqsRoute;
