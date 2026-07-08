"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Eye,
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
  createHeroSlide,
  deleteHeroSlide,
  listHeroSlides,
  resolveHeroImageUrl,
  toggleHeroSlideStatus,
  updateHeroSlide,
  type HeroSlide,
  type HeroSlidePayload,
  type HeroSlideTranslation,
} from "@/lib/heroSlidesApi";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const backgroundPositions = [
  "center center",
  "center top",
  "center bottom",
  "left center",
  "right center",
];

type HeroTranslationKey = keyof HeroSlideTranslation;

type HeroFormState = {
  imageDataUrl: string;
  primaryButtonUrl: string;
  backgroundPosition: string;
  sortOrder: number;
  isActive: boolean;
  translations: Record<Locale, HeroSlideTranslation>;
};

const defaultTranslations: Record<Locale, HeroSlideTranslation> = {
  en: {
    altText: "Amazon rainforest landscape near Iquitos, Peru",
    eyebrow: "Departing daily from Iquitos, Peru",
    titleBefore: "Explore the living",
    titleHighlight: "Amazon",
    titleAfter: "guided by people who call it home",
    description: "Discover wildlife, rivers, rainforest trails and local Amazonian hospitality with experienced guides.",
    primaryButtonText: "Book on WhatsApp",
  },
  es: {
    altText: "Paisaje de la selva amazónica cerca de Iquitos, Perú",
    eyebrow: "Salidas diarias desde Iquitos, Perú",
    titleBefore: "Explora la",
    titleHighlight: "Amazonía",
    titleAfter: "con guías locales",
    description: "Descubre fauna, ríos, caminatas por la selva y hospitalidad amazónica con guías experimentados.",
    primaryButtonText: "Reservar por WhatsApp",
  },
};

const emptyForm: HeroFormState = {
  imageDataUrl: "",
  primaryButtonUrl: "https://wa.me/51943214093",
  backgroundPosition: "center center",
  sortOrder: 0,
  isActive: true,
  translations: defaultTranslations,
};

const fileToDataUrl = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("No se pudo leer la imagen seleccionada"));
    };

    reader.onerror = () => {
      reject(new Error("No se pudo leer la imagen seleccionada"));
    };

    reader.readAsDataURL(file);
  });
};

const getSlideTranslation = (slide: HeroSlide | undefined, locale: Locale): HeroSlideTranslation => {
  const fallback = defaultTranslations[locale];
  const root: Partial<HeroSlideTranslation> = locale === "en" && slide
    ? {
        altText: slide.altText,
        eyebrow: slide.eyebrow,
        titleBefore: slide.titleBefore,
        titleHighlight: slide.titleHighlight,
        titleAfter: slide.titleAfter,
        description: slide.description,
        primaryButtonText: slide.primaryButtonText,
      }
    : {};

  return {
    altText: slide?.translations?.[locale]?.altText || root.altText || fallback.altText,
    eyebrow: slide?.translations?.[locale]?.eyebrow ?? root.eyebrow ?? fallback.eyebrow ?? null,
    titleBefore: slide?.translations?.[locale]?.titleBefore ?? root.titleBefore ?? fallback.titleBefore ?? null,
    titleHighlight: slide?.translations?.[locale]?.titleHighlight ?? root.titleHighlight ?? fallback.titleHighlight ?? null,
    titleAfter: slide?.translations?.[locale]?.titleAfter ?? root.titleAfter ?? fallback.titleAfter ?? null,
    description: slide?.translations?.[locale]?.description ?? root.description ?? fallback.description ?? null,
    primaryButtonText: slide?.translations?.[locale]?.primaryButtonText ?? root.primaryButtonText ?? fallback.primaryButtonText ?? null,
  };
};

const getFormTranslation = (form: HeroFormState, locale: Locale) => {
  return form.translations[locale] || defaultTranslations[locale];
};

const buildSlideTitle = (translation: HeroSlideTranslation) => {
  const title = [translation.titleBefore, translation.titleHighlight, translation.titleAfter]
    .filter(Boolean)
    .join(" ")
    .trim();

  return title || "Imagen sin texto superpuesto";
};

const hasTitle = (translation: HeroSlideTranslation) => {
  return Boolean(
    translation.titleBefore?.trim() ||
      translation.titleHighlight?.trim() ||
      translation.titleAfter?.trim(),
  );
};

const hasOverlayContent = (translation: HeroSlideTranslation) => {
  return Boolean(
    translation.eyebrow?.trim() ||
      hasTitle(translation) ||
      translation.description?.trim(),
  );
};

const buildFormFromSlide = (slide: HeroSlide): HeroFormState => ({
  imageDataUrl: "",
  primaryButtonUrl: slide.primaryButtonUrl || "https://wa.me/51943214093",
  backgroundPosition: slide.backgroundPosition || "center center",
  sortOrder: slide.sortOrder,
  isActive: slide.isActive,
  translations: {
    en: getSlideTranslation(slide, "en"),
    es: getSlideTranslation(slide, "es"),
  },
});

const buildPayload = (form: HeroFormState): HeroSlidePayload => {
  const english = getFormTranslation(form, "en");

  return {
    ...(form.imageDataUrl ? { imageDataUrl: form.imageDataUrl } : {}),
    ...english,
    altText: english.altText.trim(),
    eyebrow: english.eyebrow?.trim() || null,
    titleBefore: english.titleBefore?.trim() || null,
    titleHighlight: english.titleHighlight?.trim() || null,
    titleAfter: english.titleAfter?.trim() || null,
    description: english.description?.trim() || null,
    primaryButtonText: english.primaryButtonText?.trim() || null,
    primaryButtonUrl: form.primaryButtonUrl.trim() || null,
    backgroundPosition: form.backgroundPosition,
    sortOrder: Number.isFinite(Number(form.sortOrder)) ? Number(form.sortOrder) : 0,
    isActive: form.isActive,
    translations: {
      en: {
        ...form.translations.en,
        altText: form.translations.en.altText.trim(),
      },
      es: {
        ...form.translations.es,
        altText: form.translations.es.altText.trim(),
      },
    },
  };
};

const validateForm = (form: HeroFormState, editingId: string | null) => {
  if (!editingId && !form.imageDataUrl) return "Seleccione una imagen para el nuevo slide";

  for (const locale of LOCALES) {
    const translation = getFormTranslation(form, locale);
    if (!translation.altText.trim()) return `Ingrese el texto alternativo en ${localeLabels[locale]}`;
  }

  return null;
};

const HeroCarouselAdminPage = () => {
  const router = useRouter();

  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [activeLocale, setActiveLocale] = useState<Locale>("en");
  const [formData, setFormData] = useState<HeroFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCount = useMemo(() => slides.filter((slide) => slide.isActive).length, [slides]);
  const activeTranslation = getFormTranslation(formData, activeLocale);

  const setTranslationField = (field: HeroTranslationKey, value: string) => {
    setFormData((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [activeLocale]: {
          ...current.translations[activeLocale],
          [field]: value,
        },
      },
    }));
  };

  const loadSlides = async (q = search) => {
    setIsLoading(true);

    try {
      const response = await listHeroSlides({ q, includeInactive: true });
      setSlides(response.slides);
      setTotal(response.total);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo cargar el carrusel";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    getMe()
      .then(() => {
        if (!isMounted) return;
        setIsChecking(false);
        void loadSlides("");
      })
      .catch(() => {
        if (!isMounted) return;
        router.replace("/login");
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setCurrentImageUrl(null);
  };

  const handleImageChange = async (file: File | undefined) => {
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      toast.error("La imagen debe ser JPG, PNG o WEBP");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("La imagen no debe superar 5 MB");
      return;
    }

    try {
      const imageDataUrl = await fileToDataUrl(file);
      setFormData((current) => ({ ...current, imageDataUrl }));
      setCurrentImageUrl(imageDataUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo cargar la imagen seleccionada";
      toast.error(message);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const errorMessage = validateForm(formData, editingId);
    if (errorMessage) {
      toast.error(errorMessage);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = buildPayload(formData);

      if (editingId) {
        await updateHeroSlide(editingId, payload);
        toast.success("Slide bilingüe actualizado correctamente");
      } else {
        await createHeroSlide(payload);
        toast.success("Slide bilingüe registrado correctamente");
      }

      resetForm();
      await loadSlides();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo guardar el slide";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingId(slide.id);
    setCurrentImageUrl(resolveHeroImageUrl(slide.imageUrl));
    setFormData(buildFormFromSlide(slide));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleStatus = async (slide: HeroSlide) => {
    try {
      await toggleHeroSlideStatus(slide.id, !slide.isActive);
      toast.success(slide.isActive ? "Slide desactivado" : "Slide activado");
      await loadSlides();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo cambiar el estado del slide";
      toast.error(message);
    }
  };

  const handleDelete = async (slide: HeroSlide) => {
    const title = buildSlideTitle(getSlideTranslation(slide, activeLocale));
    if (!window.confirm(`¿Eliminar el slide "${title}"?`)) return;

    try {
      await deleteHeroSlide(slide.id);
      toast.success("Slide eliminado correctamente");
      await loadSlides();
      if (editingId === slide.id) resetForm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo eliminar el slide";
      toast.error(message);
    }
  };

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loadSlides(search);
  };

  const previewImageUrl = currentImageUrl;
  const hasFormTitle = hasTitle(activeTranslation);
  const hasFormOverlayContent = hasOverlayContent(activeTranslation);

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
    <div className="min-h-[70vh] bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link href="/dashboard" className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-slate-600 transition hover:border-emerald-700 hover:text-emerald-800 dark:border-slate-800 dark:text-slate-400 dark:hover:text-emerald-400">
              <ArrowLeft size={14} />
              Volver al dashboard
            </Link>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-300">Hero bilingüe editable</div>
            <h1 className="mt-3 text-2xl font-black uppercase tracking-tight text-emerald-950 dark:text-emerald-400 sm:text-3xl">Carrusel principal</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">Administra imagen compartida, textos EN/ES y orden de aparición del hero público.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-64">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total</p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">{total}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Activos</p>
              <p className="mt-1 text-2xl font-black text-emerald-800 dark:text-emerald-400">{activeCount}</p>
            </div>
          </div>
        </div>

        <LocaleTabs activeLocale={activeLocale} onChange={setActiveLocale} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,460px)_1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">{editingId ? "Editar slide" : "Nuevo slide"} — {localeLabels[activeLocale]}</h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">Use imágenes horizontales de mínimo 1600px de ancho. El backend convertirá JPG, PNG o WEBP a WEBP optimizado.</p>
              </div>

              {editingId ? (
                <button type="button" onClick={resetForm} className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-red-600 dark:border-slate-800" aria-label="Cancelar edición">
                  <X size={16} />
                </button>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">Imagen de fondo {editingId ? "(opcional al editar)" : ""}</label>
                <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-emerald-700 hover:bg-emerald-50 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-emerald-950/30">
                  <ImagePlus size={24} className="text-emerald-700 dark:text-emerald-400" />
                  <span className="text-xs font-black uppercase tracking-wide text-slate-700 dark:text-slate-200">Seleccionar imagen</span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">JPG, PNG o WEBP. Máximo 5 MB. Se guardará como WEBP.</span>
                  <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => void handleImageChange(event.target.files?.[0])} disabled={isSubmitting} />
                </label>

                {previewImageUrl ? (
                  <div className="relative min-h-56 overflow-hidden rounded-2xl bg-cover bg-center shadow-inner" style={{ backgroundImage: `url("${previewImageUrl}")`, backgroundPosition: formData.backgroundPosition }}>
                    {hasFormOverlayContent ? (
                      <div className="relative p-5 text-slate-950">
                        {activeTranslation.eyebrow ? <span className="inline-flex rounded-full bg-amber-400 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-900 shadow-sm">{activeTranslation.eyebrow}</span> : null}
                        {hasFormTitle ? (
                          <h3 className="mt-4 font-display text-3xl font-black leading-tight drop-shadow">
                            {activeTranslation.titleBefore}
                            {activeTranslation.titleHighlight ? <><br /><span className="text-amber-400">{activeTranslation.titleHighlight}</span></> : null}
                            {activeTranslation.titleAfter ? <> {activeTranslation.titleAfter}</> : null}
                          </h3>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">Texto alternativo</label>
                  <input type="text" required className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 transition-colors focus:border-emerald-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100" value={activeTranslation.altText} onChange={(event) => setTranslationField("altText", event.target.value)} disabled={isSubmitting} />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">Badge / etiqueta superior</label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 transition-colors focus:border-emerald-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100" value={activeTranslation.eyebrow || ""} onChange={(event) => setTranslationField("eyebrow", event.target.value)} disabled={isSubmitting} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">Título antes del resaltado</label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 transition-colors focus:border-emerald-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100" value={activeTranslation.titleBefore || ""} onChange={(event) => setTranslationField("titleBefore", event.target.value)} disabled={isSubmitting} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">Texto resaltado</label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 transition-colors focus:border-emerald-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100" value={activeTranslation.titleHighlight || ""} onChange={(event) => setTranslationField("titleHighlight", event.target.value)} disabled={isSubmitting} />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">Título después del resaltado</label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 transition-colors focus:border-emerald-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100" value={activeTranslation.titleAfter || ""} onChange={(event) => setTranslationField("titleAfter", event.target.value)} disabled={isSubmitting} />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">Descripción</label>
                  <textarea rows={3} className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-900 transition-colors focus:border-emerald-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100" value={activeTranslation.description || ""} onChange={(event) => setTranslationField("description", event.target.value)} disabled={isSubmitting} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">Botón principal</label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 transition-colors focus:border-emerald-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100" value={activeTranslation.primaryButtonText || ""} onChange={(event) => setTranslationField("primaryButtonText", event.target.value)} disabled={isSubmitting} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">URL botón principal</label>
                  <input type="text" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 transition-colors focus:border-emerald-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100" value={formData.primaryButtonUrl} onChange={(event) => setFormData({ ...formData, primaryButtonUrl: event.target.value })} disabled={isSubmitting} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">Posición de la imagen</label>
                  <select className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 transition-colors focus:border-emerald-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100" value={formData.backgroundPosition} onChange={(event) => setFormData({ ...formData, backgroundPosition: event.target.value })} disabled={isSubmitting}>
                    {backgroundPositions.map((position) => <option key={position} value={position}>{position}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">Orden</label>
                  <input type="number" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 transition-colors focus:border-emerald-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100" value={formData.sortOrder} onChange={(event) => setFormData({ ...formData, sortOrder: Number(event.target.value) })} disabled={isSubmitting} />
                </div>
              </div>

              <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                <span>Mostrar slide en el carrusel público</span>
                <input type="checkbox" checked={formData.isActive} onChange={(event) => setFormData({ ...formData, isActive: event.target.checked })} disabled={isSubmitting} className="h-4 w-4 accent-emerald-700" />
              </label>

              <button type="submit" disabled={isSubmitting} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60">
                {editingId ? <Save size={16} /> : <Plus size={16} />}
                {isSubmitting ? "Guardando..." : editingId ? "Guardar cambios" : "Registrar slide"}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <form onSubmit={handleSearchSubmit} className="mb-5 flex flex-col gap-3 sm:flex-row">
              <input type="search" placeholder="Buscar por título, etiqueta o texto..." className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 transition-colors focus:border-emerald-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100" value={search} onChange={(event) => setSearch(event.target.value)} />
              <button type="submit" disabled={isLoading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-emerald-800 transition hover:bg-emerald-50 disabled:opacity-60 dark:text-emerald-400">
                <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
                Buscar
              </button>
            </form>

            {slides.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Todavía no hay imágenes registradas.</p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Cree el primer slide para reemplazar el fondo temporal del hero.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {slides.map((slide) => {
                  const translation = getSlideTranslation(slide, activeLocale);
                  const showOverlayContent = hasOverlayContent(translation);
                  const showTitle = hasTitle(translation);

                  return (
                    <article key={slide.id} className="overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                      <div className="relative min-h-56 bg-cover bg-center" style={{ backgroundImage: `url("${resolveHeroImageUrl(slide.imageUrl)}")`, backgroundPosition: slide.backgroundPosition }}>
                        <div className="relative p-5 text-slate-950 sm:p-6">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${slide.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>{slide.isActive ? "Activo" : "Inactivo"}</span>
                            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-800 shadow-sm">Orden {slide.sortOrder}</span>
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-800">{activeLocale.toUpperCase()}</span>
                          </div>

                          {showOverlayContent ? (
                            <>
                              {translation.eyebrow ? <p className="mt-4 text-[11px] font-bold uppercase tracking-wide text-white/80">{translation.eyebrow}</p> : null}
                              {showTitle ? (
                                <h3 className="mt-2 max-w-3xl font-display text-3xl font-black leading-tight drop-shadow sm:text-4xl">
                                  {translation.titleBefore}
                                  {translation.titleHighlight ? <><br /><span className="text-amber-400">{translation.titleHighlight}</span></> : null}
                                  {translation.titleAfter ? <> {translation.titleAfter}</> : null}
                                </h3>
                              ) : null}
                              {translation.description ? <p className="mt-3 max-w-2xl text-sm leading-7 text-white/75">{translation.description}</p> : null}
                            </>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">Texto alternativo</p>
                          <p className="mt-1 break-words text-xs font-semibold text-slate-700 dark:text-slate-300">{translation.altText}</p>
                          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Actualizado: {new Date(slide.updatedAt).toLocaleDateString("es-PE")}</p>
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-2">
                          <a href={resolveHeroImageUrl(slide.imageUrl)} target="_blank" rel="noreferrer" className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-emerald-700 hover:text-emerald-800 dark:border-slate-800 dark:text-slate-300" aria-label="Ver imagen">
                            <Eye size={15} />
                          </a>
                          <button type="button" onClick={() => handleToggleStatus(slide)} className="rounded-full border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-600 transition hover:border-emerald-700 hover:text-emerald-800 dark:border-slate-800 dark:text-slate-300">{slide.isActive ? "Desactivar" : "Activar"}</button>
                          <button type="button" onClick={() => handleEdit(slide)} className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-emerald-700 hover:text-emerald-800 dark:border-slate-800 dark:text-slate-300" aria-label="Editar slide"><Pencil size={15} /></button>
                          <button type="button" onClick={() => handleDelete(slide)} className="grid h-9 w-9 place-items-center rounded-full border border-red-200 text-red-600 transition hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/30" aria-label="Eliminar slide"><Trash2 size={15} /></button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default HeroCarouselAdminPage;
