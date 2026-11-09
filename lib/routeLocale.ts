import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";

/** Reject unknown URL locales instead of silently serving English at a foreign URL. */
export const requireRouteLocale = (value: string): Locale => {
  if (!isLocale(value)) notFound();
  return value;
};
