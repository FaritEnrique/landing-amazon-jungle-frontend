import { requireRouteLocale } from "@/lib/routeLocale";
import { redirect } from "next/navigation";
import { getFaqPath } from "@/lib/faqRoutes";
import FaqPublicPage, { buildFaqMetadata } from "../faqs/faqPageShared";

// Content is controlled by the owner and can appear or disappear at runtime.
export const dynamic = "force-dynamic";

export const generateStaticParams = () => [{ locale: "en" }, { locale: "es" }];

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale: rawLocale } = await params;
  const locale = requireRouteLocale(rawLocale);
  return buildFaqMetadata(locale);
};

const PreguntasFrecuentesRoute = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale: rawLocale } = await params;
  const locale = requireRouteLocale(rawLocale);

  if (locale === "en") {
    redirect(getFaqPath(locale));
  }

  return <FaqPublicPage locale={locale} />;
};

export default PreguntasFrecuentesRoute;
