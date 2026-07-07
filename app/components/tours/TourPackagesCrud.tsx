"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Eye,
  EyeOff,
  ImagePlus,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getMe } from "@/lib/authApi";
import {
  actualizarTourPackage,
  crearTourPackage,
  eliminarTourPackage,
  listarTourPackages,
  reordenarTourPackages,
  resolveTourPackageImageUrl,
  type TourPackagePayload,
} from "@/lib/tourPackagesApi";
import type { TourPackage } from "./tourPackageTypes";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

interface TourPackageFormState {
  duration: string;
  overlayTitle: string;
  price: string;
  imageAlt: string;
  imageFile: File | null;
  bottomTitle: string;
  bottomDescription: string;
  buttonLabel: string;
  buttonHref: string;
  excerpt: string;
  longDescription: string;
  durationDays: number | "";
  durationNights: number | "";
  location: string;
  meetingPoint: string;
  priceCurrency: string;
  priceAmount: number | "";
  seoAltText: string;
  isFeatured: boolean;
  active: boolean;
  sortOrder: number;
}

const emptyForm: TourPackageFormState = {
  duration: "3 Days 2 nights:",
  overlayTitle: "“Full expeditions trip”",
  price: "$500.00",
  imageAlt: "",
  imageFile: null,
  bottomTitle: "Full expeditions trip",
  bottomDescription: "",
  buttonLabel: "View tour",
  buttonHref: "#contact",
  excerpt: "",
  longDescription: "",
  durationDays: "",
  durationNights: "",
  location: "Iquitos, Loreto",
  meetingPoint: "",
  priceCurrency: "USD",
  priceAmount: "",
  seoAltText: "",
  isFeatured: false,
  active: true,
  sortOrder: 0,
};

const validateImageFile = (file: File) => {
  if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
    return "La imagen debe ser JPG, PNG o WEBP";
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "La imagen no debe superar 5 MB";
  }

  return null;
};

const shouldRenderImageUnoptimized = (url: string) => {
  return url.startsWith("blob:") || url.startsWith("data:");
};

const buildFormFromPackage = (pkg: TourPackage): TourPackageFormState => {
  return {
    duration: pkg.duration,
    overlayTitle: pkg.overlayTitle,
    price: pkg.price,
    imageAlt: pkg.imageAlt || "",
    imageFile: null,
    bottomTitle: pkg.bottomTitle,
    bottomDescription: pkg.bottomDescription || "",
    buttonLabel: pkg.buttonLabel || "",
    buttonHref: pkg.buttonHref || "",
    excerpt: pkg.excerpt || "",
    longDescription: pkg.longDescription || "",
    durationDays: pkg.durationDays ?? "",
    durationNights: pkg.durationNights ?? "",
    location: pkg.location || "",
    meetingPoint: pkg.meetingPoint || "",
    priceCurrency: pkg.priceCurrency || "USD",
    priceAmount: pkg.priceAmount ? Number(pkg.priceAmount) : "",
    seoAltText: pkg.seoAltText || "",
    isFeatured: Boolean(pkg.isFeatured),
    active: pkg.active,
    sortOrder: pkg.sortOrder,
  };
};

const buildPayloadFromForm = (formData: TourPackageFormState): TourPackagePayload => {
  return {
    duration: formData.duration.trim(),
    overlayTitle: formData.overlayTitle.trim(),
    price: formData.price.trim(),
    imageAlt: formData.imageAlt.trim(),
    imageFile: formData.imageFile,
    bottomTitle: formData.bottomTitle.trim(),
    bottomDescription: formData.bottomDescription.trim() || null,
    buttonLabel: formData.buttonLabel.trim() || null,
    buttonHref: formData.buttonHref.trim() || null,
    excerpt: formData.excerpt.trim() || null,
    longDescription: formData.longDescription.trim() || null,
    durationDays: formData.durationDays === "" ? null : Number(formData.durationDays),
    durationNights: formData.durationNights === "" ? null : Number(formData.durationNights),
    location: formData.location.trim() || null,
    meetingPoint: formData.meetingPoint.trim() || null,
    priceCurrency: formData.priceCurrency.trim() || "USD",
    priceAmount: formData.priceAmount === "" ? null : Number(formData.priceAmount),
    seoAltText: formData.seoAltText.trim() || null,
    isFeatured: formData.isFeatured,
    active: formData.active,
    sortOrder: Number.isFinite(Number(formData.sortOrder))
      ? Number(formData.sortOrder)
      : 0,
  };
};

const buildPayloadFromPackage = (
  pkg: TourPackage,
  overrides: Partial<TourPackagePayload> = {},
): TourPackagePayload => {
  return {
    duration: pkg.duration,
    overlayTitle: pkg.overlayTitle,
    price: pkg.price,
    imageAlt: pkg.imageAlt || "",
    imageFile: null,
    bottomTitle: pkg.bottomTitle,
    bottomDescription: pkg.bottomDescription || null,
    buttonLabel: pkg.buttonLabel || null,
    buttonHref: pkg.buttonHref || null,
    excerpt: pkg.excerpt || null,
    longDescription: pkg.longDescription || null,
    durationDays: pkg.durationDays ?? null,
    durationNights: pkg.durationNights ?? null,
    location: pkg.location || null,
    meetingPoint: pkg.meetingPoint || null,
    priceCurrency: pkg.priceCurrency || "USD",
    priceAmount: pkg.priceAmount ? Number(pkg.priceAmount) : null,
    seoAltText: pkg.seoAltText || null,
    isFeatured: Boolean(pkg.isFeatured),
    active: pkg.active,
    sortOrder: pkg.sortOrder,
    ...overrides,
  };
};

const TourPackagesCrud = () => {
  const router = useRouter();

  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [formData, setFormData] = useState<TourPackageFormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  const activeCount = useMemo(() => {
    return packages.filter((pkg) => pkg.active).length;
  }, [packages]);

  const loadPackages = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await listarTourPackages(true);
      setPackages(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los paquetes turísticos";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    getMe()
      .then(() => {
        if (!isMounted) return;
        setIsChecking(false);
        void loadPackages();
      })
      .catch(() => {
        if (!isMounted) return;
        router.replace("/login");
      });

    return () => {
      isMounted = false;
    };
  }, [loadPackages, router]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setCurrentImageUrl(null);
    setFileInputKey((current) => current + 1);
  };

  const setField = <TKey extends keyof TourPackageFormState>(
    key: TKey,
    value: TourPackageFormState[TKey],
  ) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleImageChange = (file: File | undefined) => {
    if (!file) {
      return;
    }

    const errorMessage = validateImageFile(file);

    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setCurrentImageUrl(previewUrl);
    setFormData((current) => ({
      ...current,
      imageFile: file,
      imageAlt: current.imageAlt || file.name,
    }));
  };

  const validateForm = () => {
    if (!formData.duration.trim()) return "Ingrese la duración del paquete";
    if (!formData.overlayTitle.trim()) return "Ingrese el texto sobre la imagen";
    if (!formData.price.trim()) return "Ingrese el precio del paquete";
    if (!editingId && !formData.imageFile) return "Seleccione una imagen para el nuevo paquete";
    if (!formData.bottomTitle.trim()) return "Ingrese el título inferior";

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errorMessage = validateForm();

    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayloadFromForm(formData);

      if (editingId) {
        await actualizarTourPackage(editingId, payload);
        toast.success("Paquete turístico actualizado correctamente");
      } else {
        await crearTourPackage(payload);
        toast.success("Paquete turístico registrado correctamente");
      }

      resetForm();
      await loadPackages();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo guardar el paquete turístico";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (pkg: TourPackage) => {
    setEditingId(pkg.id);
    setFormData(buildFormFromPackage(pkg));
    setCurrentImageUrl(resolveTourPackageImageUrl(pkg.imageWebpUrl));
    setFileInputKey((current) => current + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleStatus = async (pkg: TourPackage) => {
    try {
      await actualizarTourPackage(
        pkg.id,
        buildPayloadFromPackage(pkg, { active: !pkg.active }),
      );

      toast.success(pkg.active ? "Paquete ocultado" : "Paquete activado");
      await loadPackages();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado del paquete";

      toast.error(message);
    }
  };

  const handleDelete = async (pkg: TourPackage) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar el paquete "${pkg.bottomTitle}"?`,
    );

    if (!confirmed) return;

    try {
      await eliminarTourPackage(pkg.id);
      toast.success("Paquete turístico eliminado correctamente");

      if (editingId === pkg.id) {
        resetForm();
      }

      await loadPackages();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el paquete turístico";

      toast.error(message);
    }
  };

  const handleMove = async (pkg: TourPackage, direction: "up" | "down") => {
    const currentIndex = packages.findIndex((item) => item.id === pkg.id);

    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= packages.length) return;

    const nextPackages = [...packages];
    const currentPackage = nextPackages[currentIndex];

    nextPackages[currentIndex] = nextPackages[targetIndex];
    nextPackages[targetIndex] = currentPackage;

    setPackages(nextPackages);

    try {
      await reordenarTourPackages(nextPackages.map((item) => ({ id: item.id })));
      toast.success("Orden actualizado correctamente");
      await loadPackages();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el orden";

      toast.error(message);
      await loadPackages();
    }
  };

  if (isChecking) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 text-2xl">⏳</div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Validando sesión...
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-[70vh] bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-950"
            >
              <ArrowLeft size={14} aria-hidden="true" />
              Volver al dashboard
            </Link>

            <p className="mt-5 text-xs font-black uppercase tracking-[0.28em] text-emerald-700 dark:text-emerald-400">
              Paquetes turísticos
            </p>

            <h1 className="mt-2 text-2xl font-black uppercase tracking-tight text-emerald-950 dark:text-emerald-400 md:text-3xl">
              CRUD de tours del landing
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Administra la imagen WebP generada por backend, el texto que aparece sobre la fotografía y la información fija que se muestra debajo de cada paquete.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-72">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Activos
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-950 dark:text-emerald-300">
                {activeCount}
              </p>
            </div>

            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
              <p className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Total
              </p>
              <p className="mt-1 text-2xl font-black text-amber-950 dark:text-amber-300">
                {packages.length}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  {editingId ? "Editar paquete" : "Nuevo paquete"}
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  La imagen se sube como archivo y el backend la convierte a WebP.
                </p>
              </div>

              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-950"
                  aria-label="Cancelar edición"
                >
                  <X size={16} aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <div className="mt-5 space-y-5">
              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  <ImagePlus size={16} aria-hidden="true" />
                  Imagen del paquete
                </div>

                <div className="relative mt-4 aspect-square overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-950">
                  {currentImageUrl ? (
                    <Image
                      src={currentImageUrl}
                      alt={formData.imageAlt || "Vista previa"}
                      fill
                      sizes="(max-width: 768px) 100vw, 420px"
                      className="object-cover"
                      unoptimized={shouldRenderImageUnoptimized(currentImageUrl)}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-6 text-center text-xs font-semibold text-slate-400">
                      Selecciona una imagen JPG, PNG o WEBP. El backend guardará la versión WebP.
                    </div>
                  )}
                </div>

                <label className="mt-4 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Subir imagen
                </label>

                <input
                  key={fileInputKey}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={(event: ChangeEvent<HTMLInputElement>) =>
                    handleImageChange(event.target.files?.[0])
                  }
                  className="mt-2 w-full rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 file:mr-3 file:rounded-full file:border-0 file:bg-emerald-800 file:px-3 file:py-1.5 file:text-xs file:font-black file:text-white dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                />

                <label className="mt-4 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Texto alternativo
                </label>

                <input
                  value={formData.imageAlt}
                  onChange={(event) => setField("imageAlt", event.target.value)}
                  placeholder="Ejemplo: Tour de 3 días con oso perezoso"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  Texto sobre la imagen
                </h3>

                <label className="mt-4 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Duración
                </label>
                <input
                  value={formData.duration}
                  onChange={(event) => setField("duration", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                />

                <label className="mt-4 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Título sobre fotografía
                </label>
                <input
                  value={formData.overlayTitle}
                  onChange={(event) => setField("overlayTitle", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                />

                <label className="mt-4 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Precio
                </label>
                <input
                  value={formData.price}
                  onChange={(event) => setField("price", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  Información inferior
                </h3>

                <label className="mt-4 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Título inferior
                </label>
                <input
                  value={formData.bottomTitle}
                  onChange={(event) => setField("bottomTitle", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                />

                <label className="mt-4 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Descripción
                </label>
                <textarea
                  value={formData.bottomDescription}
                  onChange={(event) => setField("bottomDescription", event.target.value)}
                  rows={4}
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                />

                <label className="mt-4 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Texto del botón
                </label>
                <input
                  value={formData.buttonLabel}
                  onChange={(event) => setField("buttonLabel", event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                />

                <label className="mt-4 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Enlace del botón
                </label>
                <input
                  value={formData.buttonHref}
                  onChange={(event) => setField("buttonHref", event.target.value)}
                  placeholder="#contact o /tours/full-expedition"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <h3 className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                  SEO visible del paquete
                </h3>

                <label className="mt-4 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Resumen corto para la card
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(event) => setField("excerpt", event.target.value)}
                  rows={3}
                  placeholder="Texto breve con palabras naturales: tour en Iquitos, Amazonía peruana, naturaleza, cultura..."
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                />

                <label className="mt-4 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Descripción larga interna
                </label>
                <textarea
                  value={formData.longDescription}
                  onChange={(event) => setField("longDescription", event.target.value)}
                  rows={4}
                  placeholder="Contenido más completo para JSON-LD y futuras mejoras sin crear nuevas páginas visibles."
                  className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                />

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Días
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={formData.durationDays}
                      onChange={(event) =>
                        setField(
                          "durationDays",
                          event.target.value === "" ? "" : Number(event.target.value),
                        )
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Noches
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={formData.durationNights}
                      onChange={(event) =>
                        setField(
                          "durationNights",
                          event.target.value === "" ? "" : Number(event.target.value),
                        )
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                    />
                  </label>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Moneda SEO
                    </span>
                    <input
                      value={formData.priceCurrency}
                      onChange={(event) => setField("priceCurrency", event.target.value.toUpperCase())}
                      placeholder="USD o PEN"
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                    />
                  </label>

                  <label className="block">
                    <span className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Precio numérico SEO
                    </span>
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={formData.priceAmount}
                      onChange={(event) =>
                        setField(
                          "priceAmount",
                          event.target.value === "" ? "" : Number(event.target.value),
                        )
                      }
                      className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                    />
                  </label>
                </div>

                <label className="mt-4 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Ubicación / experiencia
                </label>
                <input
                  value={formData.location}
                  onChange={(event) => setField("location", event.target.value)}
                  placeholder="Ej. Iquitos, Loreto, Amazonía peruana"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                />

                <label className="mt-4 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Punto de encuentro
                </label>
                <input
                  value={formData.meetingPoint}
                  onChange={(event) => setField("meetingPoint", event.target.value)}
                  placeholder="Ej. Puerto de Iquitos / Hotel del cliente"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                />

                <label className="mt-4 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Alt SEO preferente
                </label>
                <input
                  value={formData.seoAltText}
                  onChange={(event) => setField("seoAltText", event.target.value)}
                  placeholder="Ej. Tour de aventura en la Amazonía peruana desde Iquitos"
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-bold dark:border-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(event) => setField("active", event.target.checked)}
                    className="h-4 w-4 accent-emerald-800"
                  />
                  Mostrar en landing
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-bold dark:border-slate-800">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(event) => setField("isFeatured", event.target.checked)}
                    className="h-4 w-4 accent-emerald-800"
                  />
                  Destacar para SEO
                </label>

                <label className="block rounded-2xl border border-slate-200 p-4 dark:border-slate-800 sm:col-span-2">
                  <span className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Orden
                  </span>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(event) => setField("sortOrder", Number(event.target.value))}
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-800 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editingId ? <Save size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                {isSubmitting
                  ? "Guardando..."
                  : editingId
                    ? "Guardar cambios"
                    : "Crear paquete"}
              </button>
            </div>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">
                  Paquetes registrados
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Administra la visibilidad, el orden y el contenido del bloque público.
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadPackages()}
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-950"
              >
                <RefreshCw size={15} aria-hidden="true" />
                Actualizar
              </button>
            </div>

            {isLoading ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm font-semibold text-slate-400 dark:border-slate-700">
                Cargando paquetes turísticos...
              </div>
            ) : null}

            {!isLoading && packages.length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm font-semibold text-slate-400 dark:border-slate-700">
                No hay paquetes registrados todavía.
              </div>
            ) : null}

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {packages.map((pkg, index) => (
                <article
                  key={pkg.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950"
                >
                  <div className="relative aspect-square overflow-hidden bg-slate-200 dark:bg-slate-900">
                    {pkg.imageWebpUrl ? (
                      <Image
                        src={resolveTourPackageImageUrl(pkg.imageWebpUrl)}
                        alt={pkg.imageAlt || pkg.overlayTitle}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : null}

                    <span
                      className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
                        pkg.active
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {pkg.active ? "Activo" : "Oculto"}
                    </span>

                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-4 text-white">
                      <p className="text-xs font-bold">{pkg.duration}</p>
                      <p className="line-clamp-2 text-sm font-black">{pkg.overlayTitle}</p>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="line-clamp-2 text-sm font-black text-slate-900 dark:text-white">
                          {pkg.bottomTitle}
                        </h3>
                        <p className="mt-1 text-sm font-black text-emerald-800 dark:text-emerald-300">
                          {pkg.price}
                        </p>
                      </div>

                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                        #{pkg.sortOrder}
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                      {pkg.bottomDescription || "Sin descripción inferior."}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(pkg)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
                      >
                        <Pencil size={13} aria-hidden="true" />
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleToggleStatus(pkg)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-600 transition hover:bg-white dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                      >
                        {pkg.active ? <EyeOff size={13} aria-hidden="true" /> : <Eye size={13} aria-hidden="true" />}
                        {pkg.active ? "Ocultar" : "Mostrar"}
                      </button>

                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => void handleMove(pkg, "up")}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                      >
                        <ArrowUp size={13} aria-hidden="true" />
                        Subir
                      </button>

                      <button
                        type="button"
                        disabled={index === packages.length - 1}
                        onClick={() => void handleMove(pkg, "down")}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
                      >
                        <ArrowDown size={13} aria-hidden="true" />
                        Bajar
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDelete(pkg)}
                        className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-red-700 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40"
                      >
                        <Trash2 size={13} aria-hidden="true" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourPackagesCrud;
