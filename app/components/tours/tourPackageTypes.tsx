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

  active: boolean;
  sortOrder: number;

  createdAt?: string;
  updatedAt?: string;
}
