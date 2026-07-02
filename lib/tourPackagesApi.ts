import type { TourPackage } from "@/app/components/tours/tourPackageTypes";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: string[];
}

export interface TourPackagePayload {
  duration: string;
  overlayTitle: string;
  price: string;

  imageAlt?: string;
  imageFile?: File | null;

  bottomTitle: string;
  bottomDescription?: string;
  buttonLabel?: string;
  buttonHref?: string;

  active: boolean;
  sortOrder: number;
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

    return result.message || fallback;
  } catch {
    return fallback;
  }
};

export const listarTourPackages = async (includeInactive = false) => {
  const response = await fetch(
    `${API_URL}/api/tour-packages?includeInactive=${includeInactive}`,
    {
      cache: "no-store",
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