import type { Locale } from "@/lib/i18n";

export interface TourPackageTranslation {
  duration: string;
  overlayTitle: string;
  imageAlt?: string | null;
  bottomTitle: string;
  bottomDescription?: string | null;
  buttonLabel?: string | null;
  excerpt?: string | null;
  longDescription?: string | null;
  location?: string | null;
  meetingPoint?: string | null;
  seoAltText?: string | null;
}

export interface TourPackage {
  id: number;
  locale?: Locale;

  duration: string;
  overlayTitle: string;
  price: string;

  imageOriginalUrl?: string | null;
  imageWebpUrl: string;
  imageAlt?: string | null;

  bottomTitle: string;
  bottomDescription?: string | null;
  buttonLabel?: string | null;
  buttonHref?: string | null;

  excerpt?: string | null;
  longDescription?: string | null;
  durationDays?: number | null;
  durationNights?: number | null;
  location?: string | null;
  meetingPoint?: string | null;
  priceCurrency?: string | null;
  priceAmount?: string | number | null;
  seoAltText?: string | null;
  isFeatured?: boolean;

  active: boolean;
  sortOrder: number;

  createdAt?: string;
  translations?: Partial<Record<Locale, TourPackageTranslation>>;
  updatedAt?: string;
}
