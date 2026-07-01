const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface SeoKeyword {
  id: string;
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

export interface PublicSeoMetadata {
  title: string;
  description: string;
  keywords: string[];
}

export interface SeoKeywordPayload {
  phrase: string;
  source?: string | null;
  notes?: string | null;
  isActive?: boolean;
}

const parseApiResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || "No se pudo completar la operación");
  }

  return data as T;
};

export const getPublicSeoMetadata = async () => {
  const response = await fetch(`${API_URL}/api/seo/meta`, {
    method: "GET",
    cache: "no-store",
  });

  return parseApiResponse<{
    ok: boolean;
    data: PublicSeoMetadata;
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
