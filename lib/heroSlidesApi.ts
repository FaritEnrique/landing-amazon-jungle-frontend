import type { Locale } from "@/lib/i18n";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface HeroSlideTranslation {
  altText: string;
  eyebrow?: string | null;
  titleBefore?: string | null;
  titleHighlight?: string | null;
  titleAfter?: string | null;
  description?: string | null;
  primaryButtonText?: string | null;
}

export interface HeroSlide {
  id: string;
  locale?: Locale;
  imageUrl: string;
  altText: string;
  eyebrow: string | null;
  titleBefore: string | null;
  titleHighlight: string | null;
  titleAfter: string | null;
  description: string | null;
  primaryButtonText: string | null;
  primaryButtonUrl: string | null;
  backgroundPosition: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  translations?: Partial<Record<Locale, HeroSlideTranslation>>;
  updatedAt: string;
  createdBy?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
  updatedBy?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export interface HeroSlidePayload extends HeroSlideTranslation {
  imageDataUrl?: string;
  eyebrow?: string | null;
  titleBefore?: string | null;
  titleHighlight?: string | null;
  titleAfter?: string | null;
  description?: string | null;
  primaryButtonText?: string | null;
  primaryButtonUrl?: string | null;
  backgroundPosition?: string;
  sortOrder?: number;
  isActive?: boolean;
  translations?: Partial<Record<Locale, HeroSlideTranslation>>;
}

const parseApiResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "No se pudo completar la operación");
  }

  return data as T;
};

export const resolveHeroImageUrl = (imageUrl: string) => {
  if (!imageUrl) {
    return "";
  }

  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  if (imageUrl.startsWith("/uploads/")) {
    return `${API_URL}${imageUrl}`;
  }

  return imageUrl;
};

export const listPublicHeroSlides = async (
  locale: Locale = "en",
  fetchOptions: RequestInit & { next?: { revalidate?: number } } = {},
) => {
  const response = await fetch(`${API_URL}/api/hero-slides/public?locale=${locale}`, {
    method: "GET",
    cache: "force-cache",
    next: {
      revalidate: 300,
    },
    ...fetchOptions,
  });

  return parseApiResponse<{
    ok: boolean;
    slides: HeroSlide[];
  }>(response);
};

export const listHeroSlides = async ({
  q,
  includeInactive = true,
}: {
  q?: string;
  includeInactive?: boolean;
} = {}) => {
  const params = new URLSearchParams();

  if (q?.trim()) {
    params.set("q", q.trim());
  }

  if (includeInactive) {
    params.set("includeInactive", "true");
  }

  const query = params.toString();
  const response = await fetch(
    `${API_URL}/api/hero-slides/slides${query ? `?${query}` : ""}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    }
  );

  return parseApiResponse<{
    ok: boolean;
    total: number;
    slides: HeroSlide[];
  }>(response);
};

export const createHeroSlide = async (payload: HeroSlidePayload) => {
  const response = await fetch(`${API_URL}/api/hero-slides/slides`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse<{
    ok: boolean;
    message: string;
    slide: HeroSlide;
  }>(response);
};

export const updateHeroSlide = async (id: string, payload: HeroSlidePayload) => {
  const response = await fetch(`${API_URL}/api/hero-slides/slides/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse<{
    ok: boolean;
    message: string;
    slide: HeroSlide;
  }>(response);
};

export const toggleHeroSlideStatus = async (id: string, isActive: boolean) => {
  const response = await fetch(`${API_URL}/api/hero-slides/slides/${id}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ isActive }),
  });

  return parseApiResponse<{
    ok: boolean;
    message: string;
    slide: HeroSlide;
  }>(response);
};

export const deleteHeroSlide = async (id: string) => {
  const response = await fetch(`${API_URL}/api/hero-slides/slides/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  return parseApiResponse<{
    ok: boolean;
    message: string;
  }>(response);
};
