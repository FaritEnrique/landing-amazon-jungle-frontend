import type { Locale } from "@/lib/i18n";
import type { TourPackage, TourPackageTranslation } from "@/app/components/tours/tourPackageTypes";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface ApiResponse<T> {
  ok?: boolean;
  data: T;
  message?: string;
  error?: string;
  errors?: string[];
}

export interface TourPackagePayload extends TourPackageTranslation {
  duration: string;
  overlayTitle: string;
  price: string;

  imageAlt?: string | null;
  imageFile?: File | null;

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
  priceAmount?: number | null;
  seoAltText?: string | null;
  isFeatured?: boolean;

  active: boolean;
  sortOrder: number;
  translations?: Partial<Record<Locale, TourPackageTranslation>>;
}

const buildFormData = (payload: TourPackagePayload) => {
  const formData = new FormData();

  formData.append("duration", payload.duration);
  formData.append("overlayTitle", payload.overlayTitle);
  formData.append("price", payload.price);
  formData.append("imageAlt", payload.imageAlt || "");

  formData.append("bottomTitle", payload.bottomTitle);
  formData.append("bottomDescription", payload.bottomDescription || "");
  formData.append("buttonLabel", payload.buttonLabel || "");
  formData.append("buttonHref", payload.buttonHref || "");

  formData.append("excerpt", payload.excerpt || "");
  formData.append("longDescription", payload.longDescription || "");
  formData.append("durationDays", payload.durationDays ? String(payload.durationDays) : "");
  formData.append("durationNights", payload.durationNights ? String(payload.durationNights) : "");
  formData.append("location", payload.location || "");
  formData.append("meetingPoint", payload.meetingPoint || "");
  formData.append("priceCurrency", payload.priceCurrency || "USD");
  formData.append("priceAmount", payload.priceAmount ? String(payload.priceAmount) : "");
  formData.append("seoAltText", payload.seoAltText || "");
  formData.append("isFeatured", String(payload.isFeatured || false));

  if (payload.translations) {
    formData.append("translations", JSON.stringify(payload.translations));
  }

  formData.append("active", String(payload.active));
  formData.append("sortOrder", String(payload.sortOrder || 0));

  if (payload.imageFile) {
    formData.append("image", payload.imageFile);
  }

  return formData;
};

const getErrorMessage = async (response: Response, fallback: string) => {
  try {
    const result = (await response.json()) as ApiResponse<unknown>;

    if (result.errors?.length) {
      return result.errors.join(" ");
    }

    return result.error || result.message || fallback;
  } catch {
    return fallback;
  }
};

export const resolveTourPackageImageUrl = (imageUrl: string) => {
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

export const listarTourPackages = async (
  includeInactive = false,
  fetchOptions: RequestInit & { next?: { revalidate?: number } } = {},
  locale: Locale = "en",
) => {
  const endpoint = includeInactive
    ? `${API_URL}/api/tour-packages/admin/lista?includeInactive=true&locale=${locale}`
    : `${API_URL}/api/tour-packages?includeInactive=false&locale=${locale}`;

  const response = await fetch(
    endpoint,
    {
      method: "GET",
      credentials: "include",
      cache: "no-store",
      ...fetchOptions,
    },
  );

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "No se pudieron obtener los paquetes turísticos.",
    );

    throw new Error(message);
  }

  const result = (await response.json()) as ApiResponse<TourPackage[]>;

  return result.data;
};

export const crearTourPackage = async (payload: TourPackagePayload) => {
  const response = await fetch(`${API_URL}/api/tour-packages`, {
    method: "POST",
    credentials: "include",
    body: buildFormData(payload),
  });

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "No se pudo crear el paquete turístico.",
    );

    throw new Error(message);
  }

  const result = (await response.json()) as ApiResponse<TourPackage>;

  return result.data;
};

export const actualizarTourPackage = async (
  id: number,
  payload: TourPackagePayload,
) => {
  const response = await fetch(`${API_URL}/api/tour-packages/${id}`, {
    method: "PUT",
    credentials: "include",
    body: buildFormData(payload),
  });

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "No se pudo actualizar el paquete turístico.",
    );

    throw new Error(message);
  }

  const result = (await response.json()) as ApiResponse<TourPackage>;

  return result.data;
};

export const eliminarTourPackage = async (id: number) => {
  const response = await fetch(`${API_URL}/api/tour-packages/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "No se pudo eliminar el paquete turístico.",
    );

    throw new Error(message);
  }
};

export const reordenarTourPackages = async (
  items: Pick<TourPackage, "id">[],
) => {
  const response = await fetch(`${API_URL}/api/tour-packages/reordenar/lista`, {
    method: "PATCH",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items,
    }),
  });

  if (!response.ok) {
    const message = await getErrorMessage(
      response,
      "No se pudieron reordenar los paquetes turísticos.",
    );

    throw new Error(message);
  }

  const result = (await response.json()) as ApiResponse<TourPackage[]>;

  return result.data;
};
