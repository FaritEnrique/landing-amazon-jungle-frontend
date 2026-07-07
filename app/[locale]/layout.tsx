import type { ReactNode } from "react";
import { copy, getLocale } from "@/lib/i18n";

const LocaleLayout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) => {
  const { locale: rawLocale } = await params;
  const locale = getLocale(rawLocale);

  return <div lang={copy[locale].htmlLang}>{children}</div>;
};

export default LocaleLayout;
