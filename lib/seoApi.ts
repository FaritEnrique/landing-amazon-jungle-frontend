import type { Locale } from "@/lib/i18n";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const PUBLIC_SEO_REVALIDATE_SECONDS = 120;

type NextFetchOptions = RequestInit & { next?: { revalidate?: number } };

export type SeoImageTarget = "og" | "twitter";

export interface SeoKeyword {
  id: string;
  locale?: Locale;
  phrase: string;
  source: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
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

export interface SeoHomeTranslation {
  title: string;
  description: string;
  canonicalUrl?: string | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  focusKeyword?: string | null;
  secondaryKeywords?: string | null;
  shareMessage?: string | null;
}

export interface SeoHome {
  id: string;
  locale?: Locale;
  title: string;
  description: string;
  canonicalUrl: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImageUrl: string | null;
  twitterTitle: string | null;
  twitterDescription: string | null;
  twitterImageUrl: string | null;
  robotsIndex: boolean;
  robotsFollow: boolean;
  focusKeyword: string | null;
  secondaryKeywords: string | null;
  shareMessage: string | null;
  createdAt: string;
  translations?: Partial<Record<Locale, SeoHomeTranslation>>;
  updatedAt: string;
}

export interface SeoBusinessProfile {
  id: string;
  businessName: string;
  legalName: string | null;
  ruc: string | null;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  latitude: string | null;
  longitude: string | null;
  logoUrl: string | null;
  facebookUrl: string | null;
  instagramUrl: string | null;
  tiktokUrl: string | null;
  youtubeUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SeoFaqTranslation {
  question: string;
  answer: string;
}

export interface SeoFaq {
  id: string;
  locale?: Locale;
  question: string;
  answer: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  translations?: Partial<Record<Locale, SeoFaqTranslation>>;
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

export interface PublicSeoMetadata extends SeoHome {
  keywords: string[];
  business: SeoBusinessProfile;
  faqs: SeoFaq[];
}

export interface LandingSeoData {
  metadata: PublicSeoMetadata;
  home: SeoHome;
  business: SeoBusinessProfile;
  faqs: SeoFaq[];
}

export interface SeoKeywordPayload {
  locale?: Locale;
  phrase: string;
  source?: string | null;
  notes?: string | null;
  isActive?: boolean;
}

export type SeoHomePayload = Omit<SeoHome, "id" | "createdAt" | "updatedAt">;
export type SeoBusinessProfilePayload = Omit<
  SeoBusinessProfile,
  "id" | "createdAt" | "updatedAt"
>;
export type SeoFaqPayload = Pick<SeoFaq, "question" | "answer" | "position" | "isActive" | "translations">;

const parseApiResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "No se pudo completar la operación");
  }

  return data as T;
};

export const getPublicSeoMetadata = async (
  locale: Locale = "en",
  fetchOptions: NextFetchOptions = {},
) => {
  const response = await fetch(`${API_URL}/api/seo/meta?locale=${locale}`, {
    method: "GET",
    cache: "force-cache",
    next: {
      revalidate: PUBLIC_SEO_REVALIDATE_SECONDS,
    },
    ...fetchOptions,
  });

  return parseApiResponse<{
    ok: boolean;
    data: PublicSeoMetadata;
  }>(response);
};

export const getPublicLandingSeo = async (
  locale: Locale = "en",
  fetchOptions: NextFetchOptions = {},
) => {
  const response = await fetch(`${API_URL}/api/seo/landing?locale=${locale}`, {
    method: "GET",
    cache: "force-cache",
    next: {
      revalidate: PUBLIC_SEO_REVALIDATE_SECONDS,
    },
    ...fetchOptions,
  });

  return parseApiResponse<{
    ok: boolean;
    data: LandingSeoData;
  }>(response);
};

export const getSeoHome = async (locale: Locale = "en") => {
  const response = await fetch(`${API_URL}/api/seo/home?locale=${locale}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseApiResponse<{
    ok: boolean;
    data: SeoHome;
  }>(response);
};

export const updateSeoHome = async (payload: SeoHomePayload) => {
  const response = await fetch(`${API_URL}/api/seo/home`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse<{
    ok: boolean;
    message: string;
    data: SeoHome;
  }>(response);
};


export const uploadSeoHomeImage = async (
  target: SeoImageTarget,
  file: File,
) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${API_URL}/api/seo/home/images/${target}`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  return parseApiResponse<{
    ok: boolean;
    message: string;
    field: "ogImageUrl" | "twitterImageUrl";
    imageUrl: string;
    data: SeoHome;
  }>(response);
};

export const deleteSeoHomeImage = async (target: SeoImageTarget) => {
  const response = await fetch(`${API_URL}/api/seo/home/images/${target}`, {
    method: "DELETE",
    credentials: "include",
  });

  return parseApiResponse<{
    ok: boolean;
    message: string;
    field: "ogImageUrl" | "twitterImageUrl";
    imageUrl: null;
    data: SeoHome;
  }>(response);
};

export const getSeoBusinessProfile = async () => {
  const response = await fetch(`${API_URL}/api/seo/business-profile`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseApiResponse<{
    ok: boolean;
    data: SeoBusinessProfile;
  }>(response);
};

export const updateSeoBusinessProfile = async (
  payload: SeoBusinessProfilePayload,
) => {
  const response = await fetch(`${API_URL}/api/seo/business-profile`, {
    method: "PUT",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return parseApiResponse<{
    ok: boolean;
    message: string;
    data: SeoBusinessProfile;
  }>(response);
};

export const listSeoFaqs = async (includeInactive = true) => {
  const response = await fetch(
    `${API_URL}/api/seo/faqs?includeInactive=${includeInactive}`,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    },
  );

  return parseApiResponse<{
    ok: boolean;
    total: number;
    faqs: SeoFaq[];
  }>(response);
};

export const createSeoFaq = async (payload: SeoFaqPayload) => {
  const response = await fetch(`${API_URL}/api/seo/faqs`, {
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
    faq: SeoFaq;
  }>(response);
};

export const updateSeoFaq = async (id: string, payload: SeoFaqPayload) => {
  const response = await fetch(`${API_URL}/api/seo/faqs/${id}`, {
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
    faq: SeoFaq;
  }>(response);
};

export const deleteSeoFaq = async (id: string) => {
  const response = await fetch(`${API_URL}/api/seo/faqs/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  return parseApiResponse<{
    ok: boolean;
    message: string;
  }>(response);
};

export const listSeoKeywords = async ({
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
  const response = await fetch(`${API_URL}/api/seo/keywords${query ? `?${query}` : ""}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  return parseApiResponse<{
    ok: boolean;
    total: number;
    keywords: SeoKeyword[];
  }>(response);
};

export const createSeoKeyword = async (payload: SeoKeywordPayload) => {
  const response = await fetch(`${API_URL}/api/seo/keywords`, {
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
    keyword: SeoKeyword;
  }>(response);
};

export const updateSeoKeyword = async (id: string, payload: SeoKeywordPayload) => {
  const response = await fetch(`${API_URL}/api/seo/keywords/${id}`, {
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
    keyword: SeoKeyword;
  }>(response);
};

export const deleteSeoKeyword = async (id: string) => {
  const response = await fetch(`${API_URL}/api/seo/keywords/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  return parseApiResponse<{
    ok: boolean;
    message: string;
  }>(response);
};
