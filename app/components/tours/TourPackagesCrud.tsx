"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
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
import LocaleTabs from "@/app/components/admin/LocaleTabs";
import { getMe } from "@/lib/authApi";
import { LOCALES, localeLabels, type Locale } from "@/lib/i18n";
import {
  actualizarTourPackage,
  crearTourPackage,
  eliminarTourPackage,
  listarTourPackages,
  reordenarTourPackages,
  resolveTourPackageImageUrl,
  type TourPackagePayload,
} from "@/lib/tourPackagesApi";
import type { TourPackage, TourPackageTranslation } from "./tourPackageTypes";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

type TourTranslationKey = keyof TourPackageTranslation;

interface TourPackageFormState {
  price: string;
  buttonHref: string;
  imageFile: File | null;
  durationDays: number | "";
  durationNights: number | "";
  priceCurrency: string;
  priceAmount: number | "";
  isFeatured: boolean;
  active: boolean;
  sortOrder: number;
  translations: Record<Locale, TourPackageTranslation>;
}

const defaultTranslations: Record<Locale, TourPackageTranslation> = {
  en: {
    duration: "3 Days 2 Nights",
    overlayTitle: "Full expedition trip",
    imageAlt: "Amazon rainforest tour from Iquitos",
    bottomTitle: "Full expedition trip",
    bottomDescription: "A complete rainforest experience with lodge stay, guided excursions and Amazon wildlife encounters.",
    buttonLabel: "View tour",
    excerpt: "A complete Amazon rainforest experience from Iquitos.",
    longDescription: "Explore the Peruvian Amazon with guided excursions, local hospitality and a comfortable jungle lodge experience.",
    location: "Iquitos, Loreto",
    meetingPoint: "Iquitos",
    seoAltText: "Amazon rainforest tour package from Iquitos Peru",
  },
  es: {
    duration: "3 días 2 noches",
    overlayTitle: "Viaje de expedición completo",
    imageAlt: "Tour en la selva amazónica desde Iquitos",
    bottomTitle: "Viaje de expedición completo",
    bottomDescription: "Una experiencia completa en la selva con estadía en albergue, excursiones guiadas y avistamiento de fauna amazónica.",
    buttonLabel: "Ver tour",
    excerpt: "Una experiencia completa en la Amazonía desde Iquitos.",
    longDescription: "Explora la Amazonía peruana con excursiones guiadas, hospitalidad local y una experiencia cómoda en albergue de selva.",
    location: "Iquitos, Loreto",
    meetingPoint: "Iquitos",
    seoAltText: "Paquete turístico en la selva amazónica desde Iquitos Perú",
  },
};

const emptyForm: TourPackageFormState = {
  price: "$500.00",
  buttonHref: "#contact",
  imageFile: null,
  durationDays: "",
  durationNights: "",
  priceCurrency: "USD",
  priceAmount: "",
  isFeatured: false,
  active: true,
  sortOrder: 0,
  translations: defaultTranslations,
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

const getPackageTranslation = (
  pkg: TourPackage | undefined,
  locale: Locale,
): TourPackageTranslation => {
  const fallback = defaultTranslations[locale];
  const root: Partial<TourPackageTranslation> = locale === "en" && pkg
    ? {
        duration: pkg.duration,
        overlayTitle: pkg.overlayTitle,
        imageAlt: pkg.imageAlt,
        bottomTitle: pkg.bottomTitle,
        bottomDescription: pkg.bottomDescription,
        buttonLabel: pkg.buttonLabel,
        excerpt: pkg.excerpt,
        longDescription: pkg.longDescription,
        location: pkg.location,
        meetingPoint: pkg.meetingPoint,
        seoAltText: pkg.seoAltText,
      }
    : {};

  return {
    duration: pkg?.translations?.[locale]?.duration || root.duration || fallback.duration,
    overlayTitle: pkg?.translations?.[locale]?.overlayTitle || root.overlayTitle || fallback.overlayTitle,
    imageAlt: pkg?.translations?.[locale]?.imageAlt ?? root.imageAlt ?? fallback.imageAlt ?? null,
    bottomTitle: pkg?.translations?.[locale]?.bottomTitle || root.bottomTitle || fallback.bottomTitle,
    bottomDescription: pkg?.translations?.[locale]?.bottomDescription ?? root.bottomDescription ?? fallback.bottomDescription ?? null,
    buttonLabel: pkg?.translations?.[locale]?.buttonLabel ?? root.buttonLabel ?? fallback.buttonLabel ?? null,
    excerpt: pkg?.translations?.[locale]?.excerpt ?? root.excerpt ?? fallback.excerpt ?? null,
    longDescription: pkg?.translations?.[locale]?.longDescription ?? root.longDescription ?? fallback.longDescription ?? null,
    location: pkg?.translations?.[locale]?.location ?? root.location ?? fallback.location ?? null,
    meetingPoint: pkg?.translations?.[locale]?.meetingPoint ?? root.meetingPoint ?? fallback.meetingPoint ?? null,
    seoAltText: pkg?.translations?.[locale]?.seoAltText ?? root.seoAltText ?? fallback.seoAltText ?? null,
  };
};

const buildFormFromPackage = (pkg: TourPackage): TourPackageFormState => ({
  price: pkg.price,
  buttonHref: pkg.buttonHref || "",
  imageFile: null,
  durationDays: pkg.durationDays ?? "",
  durationNights: pkg.durationNights ?? "",
  priceCurrency: pkg.priceCurrency || "USD",
  priceAmount: pkg.priceAmount ? Number(pkg.priceAmount) : "",
  isFeatured: Boolean(pkg.isFeatured),
  active: pkg.active,
  sortOrder: pkg.sortOrder,
  translations: {
    en: getPackageTranslation(pkg, "en"),
    es: getPackageTranslation(pkg, "es"),
  },
});

const getFormTranslation = (formData: TourPackageFormState, locale: Locale) => {
  return formData.translations[locale] || defaultTranslations[locale];
};

const normalizeTranslation = (translation: TourPackageTranslation): TourPackageTranslation => ({
  duration: translation.duration.trim(),
  overlayTitle: translation.overlayTitle.trim(),
  imageAlt: translation.imageAlt?.trim() || null,
  bottomTitle: translation.bottomTitle.trim(),
  bottomDescription: translation.bottomDescription?.trim() || null,
  buttonLabel: translation.buttonLabel?.trim() || null,
  excerpt: translation.excerpt?.trim() || null,
  longDescription: translation.longDescription?.trim() || null,
  location: translation.location?.trim() || null,
  meetingPoint: translation.meetingPoint?.trim() || null,
  seoAltText: translation.seoAltText?.trim() || null,
});

const buildPayloadFromForm = (formData: TourPackageFormState): TourPackagePayload => {
  const translations = {
    en: normalizeTranslation(formData.translations.en),
    es: normalizeTranslation(formData.translations.es),
  };
  const english = translations.en;

  return {
    ...english,
    price: formData.price.trim(),
    imageFile: formData.imageFile,
    buttonHref: formData.buttonHref.trim() || null,
    durationDays: formData.durationDays === "" ? null : Number(formData.durationDays),
    durationNights: formData.durationNights === "" ? null : Number(formData.durationNights),
    priceCurrency: formData.priceCurrency.trim() || "USD",
    priceAmount: formData.priceAmount === "" ? null : Number(formData.priceAmount),
    isFeatured: formData.isFeatured,
    active: formData.active,
    sortOrder: Number.isFinite(Number(formData.sortOrder)) ? Number(formData.sortOrder) : 0,
    translations,
  };
};

const buildPayloadFromPackage = (
  pkg: TourPackage,
  overrides: Partial<TourPackagePayload> = {},
): TourPackagePayload => {
  const translations = {
    en: normalizeTranslation(getPackageTranslation(pkg, "en")),
    es: normalizeTranslation(getPackageTranslation(pkg, "es")),
  };

  return {
    ...translations.en,
    price: pkg.price,
    imageFile: null,
    buttonHref: pkg.buttonHref || null,
    durationDays: pkg.durationDays ?? null,
    durationNights: pkg.durationNights ?? null,
    priceCurrency: pkg.priceCurrency || "USD",
    priceAmount: pkg.priceAmount ? Number(pkg.priceAmount) : null,
    isFeatured: Boolean(pkg.isFeatured),
    active: pkg.active,
    sortOrder: pkg.sortOrder,
    translations,
    ...overrides,
  };
};

const TourPackagesCrud = () => {
  const router = useRouter();

  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [activeLocale, setActiveLocale] = useState<Locale>("en");
  const [formData, setFormData] = useState<TourPackageFormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);

  const activeCount = useMemo(() => packages.filter((pkg) => pkg.active).length, [packages]);
  const currentTranslation = getFormTranslation(formData, activeLocale);

  const setField = <TKey extends keyof TourPackageFormState>(key: TKey, value: TourPackageFormState[TKey]) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const setTranslationField = (key: TourTranslationKey, value: string) => {
    setFormData((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [activeLocale]: {
          ...current.translations[activeLocale],
          [key]: value,
        },
      },
    }));
  };

  const loadPackages = useCallback(async () => {
    setIsLoading(true);

    try {
      const data = await listarTourPackages(true);
      setPackages(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudieron cargar los paquetes turísticos";
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

  const handleImageChange = (file: File | undefined) => {
    if (!file) return;

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
      translations: {
        ...current.translations,
        [activeLocale]: {
          ...current.translations[activeLocale],
          imageAlt: current.translations[activeLocale].imageAlt || file.name,
        },
      },
    }));
  };

  const validateForm = () => {
    if (!formData.price.trim()) return "Ingrese el precio del paquete";
    if (!editingId && !formData.imageFile) return "Seleccione una imagen para el nuevo paquete";

    for (const locale of LOCALES) {
      const translation = formData.translations[locale];
      if (!translation.duration.trim()) return `Ingrese la duración en ${localeLabels[locale]}`;
      if (!translation.overlayTitle.trim()) return `Ingrese el texto sobre la imagen en ${localeLabels[locale]}`;
      if (!translation.bottomTitle.trim()) return `Ingrese el título inferior en ${localeLabels[locale]}`;
    }

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
        toast.success("Paquete turístico bilingüe actualizado correctamente");
      } else {
        await crearTourPackage(payload);
        toast.success("Paquete turístico bilingüe registrado correctamente");
      }

      resetForm();
      await loadPackages();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar el paquete turístico";
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
      await actualizarTourPackage(pkg.id, buildPayloadFromPackage(pkg, { active: !pkg.active }));
      toast.success(pkg.active ? "Paquete ocultado" : "Paquete activado");
      await loadPackages();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo cambiar el estado del paquete";
      toast.error(message);
    }
  };

  const handleDelete = async (pkg: TourPackage) => {
    const translation = getPackageTranslation(pkg, activeLocale);
    if (!window.confirm(`¿Seguro que deseas eliminar el paquete "${translation.bottomTitle}"?`)) return;

    try {
      await eliminarTourPackage(pkg.id);
      toast.success("Paquete turístico eliminado correctamente");
      if (editingId === pkg.id) resetForm();
      await loadPackages();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar el paquete turístico";
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
    const targetPackage = nextPackages[targetIndex];

    if (!currentPackage || !targetPackage) return;

    nextPackages[currentIndex] = targetPackage;
    nextPackages[targetIndex] = currentPackage;
    setPackages(nextPackages);

    try {
      await reordenarTourPackages(nextPackages.map((item) => ({ id: item.id })));
      toast.success("Orden actualizado correctamente");
      await loadPackages();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo actualizar el orden";
      toast.error(message);
      await loadPackages();
    }
  };

  if (isChecking) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-3 text-2xl">⏳</div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Validando sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-[70vh] bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <Link href="/dashboard" className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-slate-600 transition hover:border-emerald-700 hover:text-emerald-800 dark:border-slate-800 dark:text-slate-400 dark:hover:text-emerald-400">
            <ArrowLeft size={14} aria-hidden="true" />
            Volver al dashboard
          </Link>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400">CMS bilingüe EN/ES</div>
              <h1 className="mt-3 text-2xl font-black uppercase tracking-tight text-emerald-950 dark:text-emerald-400 sm:text-3xl">Paquetes turísticos</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">Administra imagen, precio y datos comunes; edita textos visibles y SEO por idioma.</p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-72">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total</p>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{packages.length}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Activos</p>
                <p className="mt-1 text-2xl font-black text-emerald-800 dark:text-emerald-400">{activeCount}</p>
              </div>
            </div>
          </div>
        </div>

        <LocaleTabs activeLocale={activeLocale} onChange={setActiveLocale} className="mb-6" />

        <div className="grid gap-6 xl:grid-cols-[minmax(0,520px)_1fr]">
          <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">{editingId ? "Editar paquete" : "Nuevo paquete"} — {localeLabels[activeLocale]}</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">La pestaña activa cambia solo los textos del idioma. Precio, imagen y estado son comunes.</p>
              </div>

              {editingId ? (
                <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-red-600 dark:border-slate-800" aria-label="Cancelar edición">
                  <X size={16} aria-hidden="true" />
                </button>
              ) : null}
            </div>

            <div className="space-y-5">
              <label className="block">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Imagen {editingId ? "(opcional al editar)" : ""}</span>
                <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-emerald-700 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-emerald-950/30">
                  <ImagePlus size={24} className="text-emerald-700 dark:text-emerald-400" aria-hidden="true" />
                  <span className="text-xs font-black uppercase tracking-wide text-slate-700 dark:text-slate-200">Seleccionar imagen</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">JPG, PNG o WEBP. Máximo 5 MB.</span>
                  <input key={fileInputKey} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => handleImageChange(event.target.files?.[0])} />
                </label>
              </label>

              {currentImageUrl ? (
                <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-950">
                  <Image src={currentImageUrl} alt={currentTranslation.imageAlt || currentTranslation.overlayTitle} fill sizes="(max-width: 1024px) 100vw, 520px" className="object-cover" unoptimized={shouldRenderImageUnoptimized(currentImageUrl)} />
                </div>
              ) : null}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Duración</span>
                  <input value={currentTranslation.duration} onChange={(event) => setTranslationField("duration", event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950" />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Precio visible</span>
                  <input value={formData.price} onChange={(event) => setField("price", event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950" />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Texto sobre la imagen</span>
                  <input value={currentTranslation.overlayTitle} onChange={(event) => setTranslationField("overlayTitle", event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950" />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Alt text de imagen</span>
                  <input value={currentTranslation.imageAlt || ""} onChange={(event) => setTranslationField("imageAlt", event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950" />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Título inferior</span>
                  <input value={currentTranslation.bottomTitle} onChange={(event) => setTranslationField("bottomTitle", event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950" />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Descripción inferior</span>
                  <textarea rows={3} value={currentTranslation.bottomDescription || ""} onChange={(event) => setTranslationField("bottomDescription", event.target.value)} className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950" />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Texto del botón</span>
                  <input value={currentTranslation.buttonLabel || ""} onChange={(event) => setTranslationField("buttonLabel", event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950" />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">URL del botón</span>
                  <input value={formData.buttonHref} onChange={(event) => setField("buttonHref", event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950" />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Extracto SEO</span>
                  <textarea rows={3} value={currentTranslation.excerpt || ""} onChange={(event) => setTranslationField("excerpt", event.target.value)} className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950" />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Descripción larga</span>
                  <textarea rows={5} value={currentTranslation.longDescription || ""} onChange={(event) => setTranslationField("longDescription", event.target.value)} className="mt-2 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950" />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Ubicación</span>
                  <input value={currentTranslation.location || ""} onChange={(event) => setTranslationField("location", event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950" />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Punto de encuentro</span>
                  <input value={currentTranslation.meetingPoint || ""} onChange={(event) => setTranslationField("meetingPoint", event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950" />
                </label>

                <label className="block sm:col-span-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Alt text SEO</span>
                  <input value={currentTranslation.seoAltText || ""} onChange={(event) => setTranslationField("seoAltText", event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950" />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Días</span>
                  <input type="number" value={formData.durationDays} onChange={(event) => setField("durationDays", event.target.value === "" ? "" : Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950" />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Noches</span>
                  <input type="number" value={formData.durationNights} onChange={(event) => setField("durationNights", event.target.value === "" ? "" : Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950" />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Moneda</span>
                  <input value={formData.priceCurrency} onChange={(event) => setField("priceCurrency", event.target.value)} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950" />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Precio numérico</span>
                  <input type="number" value={formData.priceAmount} onChange={(event) => setField("priceAmount", event.target.value === "" ? "" : Number(event.target.value))} className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950" />
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-bold dark:border-slate-800">
                  <input type="checkbox" checked={formData.active} onChange={(event) => setField("active", event.target.checked)} className="h-4 w-4 accent-emerald-800" />
                  Activo en landing
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-bold dark:border-slate-800">
                  <input type="checkbox" checked={formData.isFeatured} onChange={(event) => setField("isFeatured", event.target.checked)} className="h-4 w-4 accent-emerald-800" />
                  Destacar para SEO
                </label>

                <label className="block rounded-2xl border border-slate-200 p-4 dark:border-slate-800 sm:col-span-2">
                  <span className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Orden</span>
                  <input type="number" value={formData.sortOrder} onChange={(event) => setField("sortOrder", Number(event.target.value))} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950" />
                </label>
              </div>

              <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-800 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60">
                {editingId ? <Save size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
                {isSubmitting ? "Guardando..." : editingId ? "Guardar cambios" : "Crear paquete"}
              </button>
            </div>
          </form>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-white">Paquetes registrados</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Administra visibilidad, orden y textos por idioma.</p>
              </div>

              <button type="button" onClick={() => void loadPackages()} disabled={isLoading} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-950">
                <RefreshCw size={15} aria-hidden="true" />
                Actualizar
              </button>
            </div>

            {isLoading ? <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm font-semibold text-slate-400 dark:border-slate-700">Cargando paquetes turísticos...</div> : null}
            {!isLoading && packages.length === 0 ? <div className="mt-5 rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm font-semibold text-slate-400 dark:border-slate-700">No hay paquetes registrados todavía.</div> : null}

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {packages.map((pkg, index) => {
                const translation = getPackageTranslation(pkg, activeLocale);

                return (
                  <article key={pkg.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                    <div className="relative aspect-square overflow-hidden bg-slate-200 dark:bg-slate-900">
                      {pkg.imageWebpUrl ? (
                        <Image src={resolveTourPackageImageUrl(pkg.imageWebpUrl)} alt={translation.imageAlt || translation.overlayTitle} fill sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw" className="object-cover" />
                      ) : null}

                      <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${pkg.active ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700"}`}>{pkg.active ? "Activo" : "Oculto"}</span>
                      <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-emerald-800 shadow-sm">{activeLocale.toUpperCase()}</span>

                      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 to-transparent p-4 text-white">
                        <p className="text-xs font-bold">{translation.duration}</p>
                        <p className="line-clamp-2 text-sm font-black">{translation.overlayTitle}</p>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="line-clamp-2 text-sm font-black text-slate-900 dark:text-white">{translation.bottomTitle}</h3>
                          <p className="mt-1 text-sm font-black text-emerald-800 dark:text-emerald-300">{pkg.price}</p>
                        </div>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-slate-500 dark:bg-slate-900 dark:text-slate-400">#{pkg.sortOrder}</span>
                      </div>

                      <p className="mt-3 line-clamp-3 text-xs leading-5 text-slate-500 dark:text-slate-400">{translation.bottomDescription || "Sin descripción inferior."}</p>

                      <div className="mt-4 grid grid-cols-2 gap-2">
                        <button type="button" onClick={() => handleEdit(pkg)} className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900">
                          <Pencil size={13} aria-hidden="true" />
                          Editar
                        </button>
                        <button type="button" onClick={() => void handleToggleStatus(pkg)} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-600 transition hover:bg-white dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
                          {pkg.active ? <EyeOff size={13} aria-hidden="true" /> : <Eye size={13} aria-hidden="true" />}
                          {pkg.active ? "Ocultar" : "Mostrar"}
                        </button>
                        <button type="button" disabled={index === 0} onClick={() => void handleMove(pkg, "up")} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
                          <ArrowUp size={13} aria-hidden="true" />
                          Subir
                        </button>
                        <button type="button" disabled={index === packages.length - 1} onClick={() => void handleMove(pkg, "down")} className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-slate-600 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900">
                          <ArrowDown size={13} aria-hidden="true" />
                          Bajar
                        </button>
                        <button type="button" onClick={() => void handleDelete(pkg)} className="col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 px-3 py-2 text-[10px] font-black uppercase tracking-wider text-red-700 transition hover:bg-red-50 dark:border-red-900/60 dark:text-red-300 dark:hover:bg-red-950/40">
                          <Trash2 size={13} aria-hidden="true" />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TourPackagesCrud;
