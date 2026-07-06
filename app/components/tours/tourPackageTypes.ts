export interface TourPackage {
  id: number;

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
  updatedAt?: string;
}
