"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Eye,
  HelpCircle,
  ImageUp,
  KeyRound,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getMe } from "@/lib/authApi";
import {
  createSeoFaq,
  createSeoKeyword,
  deleteSeoFaq,
  deleteSeoHomeImage,
  deleteSeoKeyword,
  getSeoBusinessProfile,
  getSeoHome,
  listSeoFaqs,
  listSeoKeywords,
  updateSeoBusinessProfile,
  uploadSeoHomeImage,
  updateSeoFaq,
  updateSeoHome,
  updateSeoKeyword,
  type SeoBusinessProfilePayload,
  type SeoFaq,
  type SeoHomePayload,
  type SeoImageTarget,
  type SeoKeyword,
} from "@/lib/seoApi";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://landing.amazonjungle-expeditions.com";

type ActiveSection = "landing" | "business" | "faqs" | "keywords";

const emptyHomeForm: SeoHomePayload = {
  title: "Amazon Jungle Expeditions | Tours en Iquitos y Amazon Tours",
  description:
    "Reserva tours en Iquitos y Amazon tours from Iquitos. Experiencias auténticas en la Amazonía peruana con naturaleza, cultura viva, lodge y excursiones guiadas.",
  canonicalUrl: "",
  ogTitle: "Tours en Iquitos y Amazon tours from Iquitos",
  ogDescription:
    "Discover Amazon Jungle Expeditions: tours, lodge, rainforest excursions and authentic experiences in the Peruvian Amazon from Iquitos.",
  ogImageUrl: "/images/seo/og-amazon-jungle-expeditions.jpg",
  twitterTitle: "",
  twitterDescription: "",
  twitterImageUrl: "",
  robotsIndex: true,
  robotsFollow: true,
  focusKeyword: "tours en Iquitos | Amazon tours from Iquitos",
  secondaryKeywords:
    "albergue en Iquitos, Amazonía peruana, excursiones en la selva, Amazon tours Peru, Peruvian Amazon tours, Iquitos jungle tours, Amazon jungle lodge Peru",
  shareMessage:
    "Descubre Amazon Jungle Expeditions: tours en Iquitos, Amazon tours from Iquitos y experiencias auténticas en la Amazonía peruana.",
};

const emptyBusinessForm: SeoBusinessProfilePayload = {
  businessName: "Amazon Jungle Expeditions",
  legalName: "",
  ruc: "",
  description:
    "Albergue y experiencias turísticas en la Amazonía peruana desde Iquitos.",
  phone: "+51 943214093",
  whatsapp: "51943214093",
  email: "",
  address: "",
  city: "Iquitos",
  region: "Loreto",
  country: "PE",
  latitude: "",
  longitude: "",
  logoUrl: "/images/logos/Logo-sbg.webp",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  youtubeUrl: "",
};

const emptyFaqForm = {
  question: "",
  answer: "",
  position: 0,
  isActive: true,
};

const emptyKeywordForm = {
  phrase: "",
  source: "",
  notes: "",
  isActive: true,
};

const normalizeNullableForm = <T extends object>(form: T): T => {
  return Object.fromEntries(
    Object.entries(form as Record<string, unknown>).map(([key, value]) => [
      key,
      typeof value === "string" && value.trim() === "" ? null : value,
    ]),
  ) as T;
};

const getLengthState = (value: string, min: number, max: number) => {
  const length = value.trim().length;

  if (length < min) return "text-amber-700 dark:text-amber-300";
  if (length > max) return "text-red-600 dark:text-red-400";

  return "text-emerald-700 dark:text-emerald-400";
};

const FieldHelp = ({
  value,
  min,
  max,
}: {
  value: string;
  min: number;
  max: number;
}) => {
  return (
    <p
      className={`mt-1 text-[10px] font-bold ${getLengthState(value, min, max)}`}
    >
      {value.trim().length} caracteres. Recomendado: {min}-{max}.
    </p>
  );
};


const getSeoImageField = (target: SeoImageTarget) => {
  return target === "og" ? "ogImageUrl" : "twitterImageUrl";
};

const getSeoImageLabel = (target: SeoImageTarget) => {
  return target === "og" ? "Imagen OG / WhatsApp" : "Imagen Twitter/X";
};

const resolveSeoPreviewUrl = (url?: string | null) => {
  if (!url) return null;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/uploads/")) {
    return `${API_URL}${url}`;
  }

  if (url.startsWith("/")) {
    return `${SITE_URL}${url}`;
  }

  return url;
};

interface SeoImageManagerProps {
  target: SeoImageTarget;
  value: string | null | undefined;
  placeholder: string;
  isBusy: boolean;
  onUrlChange: (value: string) => void;
  onUpload: (target: SeoImageTarget, event: ChangeEvent<HTMLInputElement>) => void;
  onDelete: (target: SeoImageTarget) => void;
}

const SeoImageManager = ({
  target,
  value,
  placeholder,
  isBusy,
  onUrlChange,
  onUpload,
  onDelete,
}: SeoImageManagerProps) => {
  const previewUrl = resolveSeoPreviewUrl(value);
  const inputId = `seo-image-${target}`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {getSeoImageLabel(target)}
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Recomendado: JPG/PNG/WEBP. El backend optimiza a 1200 × 630 px para redes sociales.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <label
            htmlFor={inputId}
            className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-700 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-emerald-800 transition hover:bg-emerald-50 dark:text-emerald-400 ${
              isBusy ? "pointer-events-none opacity-60" : ""
            }`}
          >
            <ImageUp size={15} />
            {value ? "Reemplazar" : "Subir"}
          </label>

          <input
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={isBusy}
            onChange={(event) => onUpload(target, event)}
          />

          {value ? (
            <button
              type="button"
              onClick={() => onDelete(target)}
              disabled={isBusy}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-[11px] font-black uppercase tracking-wider text-red-600 transition hover:bg-red-50 disabled:opacity-60 dark:border-red-900/40"
            >
              <Trash2 size={15} />
              Borrar
            </button>
          ) : null}
        </div>
      </div>

      {previewUrl ? (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <img
            src={previewUrl}
            alt={`Vista previa de ${getSeoImageLabel(target)}`}
            className="aspect-[1200/630] w-full object-cover"
          />
        </div>
      ) : (
        <div className="mt-4 flex aspect-[1200/630] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white text-center text-[11px] font-black uppercase tracking-wider text-slate-400 dark:border-slate-700 dark:bg-slate-900">
          Sin imagen configurada
        </div>
      )}

      <input
        aria-label={`${getSeoImageLabel(target)} URL`}
        value={value || ""}
        onChange={(event) => onUrlChange(event.target.value)}
        placeholder={placeholder}
        className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-900"
      />
    </div>
  );
};

const SeoKeywordsPage = () => {
  const router = useRouter();

  const [activeSection, setActiveSection] = useState<ActiveSection>("landing");
  const [homeForm, setHomeForm] = useState<SeoHomePayload>(emptyHomeForm);
  const [businessForm, setBusinessForm] =
    useState<SeoBusinessProfilePayload>(emptyBusinessForm);
  const [faqs, setFaqs] = useState<SeoFaq[]>([]);
  const [faqForm, setFaqForm] = useState(emptyFaqForm);
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<SeoKeyword[]>([]);
  const [keywordSearch, setKeywordSearch] = useState("");
  const [keywordForm, setKeywordForm] = useState(emptyKeywordForm);
  const [editingKeywordId, setEditingKeywordId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [busyImageTarget, setBusyImageTarget] = useState<SeoImageTarget | null>(null);

  const activeKeywords = useMemo(
    () => keywords.filter((keyword) => keyword.isActive).length,
    [keywords],
  );

  const activeFaqs = useMemo(
    () => faqs.filter((faq) => faq.isActive).length,
    [faqs],
  );

  const loadSeoData = async (q = keywordSearch) => {
    setIsLoading(true);

    try {
      const [home, business, faqResponse, keywordResponse] = await Promise.all([
        getSeoHome(),
        getSeoBusinessProfile(),
        listSeoFaqs(true),
        listSeoKeywords({ q, includeInactive: true }),
      ]);

      setHomeForm({ ...emptyHomeForm, ...normalizeNullableForm(home.data) });
      setBusinessForm({
        ...emptyBusinessForm,
        ...normalizeNullableForm(business.data),
      });
      setFaqs(faqResponse.faqs);
      setKeywords(keywordResponse.keywords);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cargar la configuración SEO";

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
        void loadSeoData("");
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

  const handleSaveHome = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!homeForm.title.trim() || !homeForm.description.trim()) {
      toast.error("Ingrese título SEO y descripción SEO de la landing");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = normalizeNullableForm(homeForm) as SeoHomePayload;
      await updateSeoHome(payload);
      toast.success("SEO de la landing actualizado correctamente");
      await loadSeoData();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el SEO de la landing";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleUploadSeoImage = async (
    target: SeoImageTarget,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Seleccione una imagen JPG, PNG o WEBP");
      return;
    }

    setBusyImageTarget(target);

    try {
      const response = await uploadSeoHomeImage(target, file);
      const field = getSeoImageField(target);

      setHomeForm((current) => ({
        ...current,
        [field]: response.imageUrl,
      }));

      toast.success(response.message || "Imagen SEO actualizada correctamente");
      await loadSeoData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo cargar la imagen SEO";

      toast.error(message);
    } finally {
      setBusyImageTarget(null);
    }
  };

  const handleDeleteSeoImage = async (target: SeoImageTarget) => {
    const label = getSeoImageLabel(target);

    if (!window.confirm(`¿Borrar la ${label.toLowerCase()}?`)) {
      return;
    }

    setBusyImageTarget(target);

    try {
      const response = await deleteSeoHomeImage(target);
      const field = getSeoImageField(target);

      setHomeForm((current) => ({
        ...current,
        [field]: "",
      }));

      toast.success(response.message || "Imagen SEO eliminada correctamente");
      await loadSeoData();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo borrar la imagen SEO";

      toast.error(message);
    } finally {
      setBusyImageTarget(null);
    }
  };

  const handleSaveBusiness = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!businessForm.businessName.trim()) {
      toast.error("Ingrese el nombre comercial del negocio");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = normalizeNullableForm(
        businessForm,
      ) as SeoBusinessProfilePayload;
      await updateSeoBusinessProfile(payload);
      toast.success("Perfil del negocio actualizado correctamente");
      await loadSeoData();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el perfil del negocio";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetFaqForm = () => {
    setFaqForm(emptyFaqForm);
    setEditingFaqId(null);
  };

  const handleSaveFaq = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!faqForm.question.trim() || !faqForm.answer.trim()) {
      toast.error("Ingrese la pregunta y la respuesta");
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingFaqId) {
        await updateSeoFaq(editingFaqId, faqForm);
        toast.success("Pregunta frecuente actualizada");
      } else {
        await createSeoFaq(faqForm);
        toast.success("Pregunta frecuente registrada");
      }

      resetFaqForm();
      await loadSeoData();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo guardar la pregunta frecuente";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditFaq = (faq: SeoFaq) => {
    setEditingFaqId(faq.id);
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      position: faq.position,
      isActive: faq.isActive,
    });
  };

  const handleDeleteFaq = async (faq: SeoFaq) => {
    if (!window.confirm(`¿Eliminar la pregunta "${faq.question}"?`)) {
      return;
    }

    try {
      await deleteSeoFaq(faq.id);
      toast.success("Pregunta frecuente eliminada");
      await loadSeoData();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la pregunta frecuente";

      toast.error(message);
    }
  };

  const resetKeywordForm = () => {
    setKeywordForm(emptyKeywordForm);
    setEditingKeywordId(null);
  };

  const handleSaveKeyword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!keywordForm.phrase.trim()) {
      toast.error("Ingrese una palabra o frase objetivo");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        phrase: keywordForm.phrase.trim(),
        source: keywordForm.source.trim() || null,
        notes: keywordForm.notes.trim() || null,
        isActive: keywordForm.isActive,
      };

      if (editingKeywordId) {
        await updateSeoKeyword(editingKeywordId, payload);
        toast.success("Frase objetivo actualizada");
      } else {
        await createSeoKeyword(payload);
        toast.success("Frase objetivo registrada");
      }

      resetKeywordForm();
      await loadSeoData();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo guardar la frase objetivo";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditKeyword = (keyword: SeoKeyword) => {
    setEditingKeywordId(keyword.id);
    setKeywordForm({
      phrase: keyword.phrase,
      source: keyword.source || "",
      notes: keyword.notes || "",
      isActive: keyword.isActive,
    });
  };

  const handleDeleteKeyword = async (keyword: SeoKeyword) => {
    if (!window.confirm(`¿Eliminar la frase "${keyword.phrase}"?`)) {
      return;
    }

    try {
      await deleteSeoKeyword(keyword.id);
      toast.success("Frase objetivo eliminada");
      await loadSeoData();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la frase objetivo";

      toast.error(message);
    }
  };

  const handleKeywordSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loadSeoData(keywordSearch);
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

  const sections = [
    { id: "landing" as const, label: "Landing", icon: Eye },
    { id: "business" as const, label: "Negocio", icon: Building2 },
    { id: "faqs" as const, label: "FAQs", icon: HelpCircle },
    { id: "keywords" as const, label: "Frases", icon: KeyRound },
  ];

  return (
    <div className="min-h-[70vh] bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-slate-600 transition hover:border-emerald-700 hover:text-emerald-800 dark:border-slate-800 dark:text-slate-400 dark:hover:text-emerald-400"
          >
            <ArrowLeft size={14} />
            Volver al dashboard
          </Link>

          <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400">
                SEO dinámico de una sola landing
              </div>

              <h1 className="mt-3 text-2xl font-black uppercase tracking-tight text-emerald-950 dark:text-emerald-400 sm:text-3xl">
                SEO de la página principal
              </h1>

              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                Administra metadata, Open Graph, datos del negocio, preguntas
                frecuentes y frases objetivo. Todo se aplica a la única página
                pública <strong>/</strong>.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:min-w-96">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  FAQs activas
                </p>
                <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                  {activeFaqs}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Frases activas
                </p>
                <p className="mt-1 text-2xl font-black text-emerald-800 dark:text-emerald-400">
                  {activeKeywords}
                </p>
              </div>

              <button
                type="button"
                onClick={() => void loadSeoData()}
                disabled={isLoading}
                className="rounded-2xl border border-emerald-700 px-4 py-3 text-xs font-black uppercase tracking-wider text-emerald-800 transition hover:bg-emerald-50 disabled:opacity-60 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
              >
                <RefreshCw
                  size={16}
                  className={`mx-auto mb-1 ${isLoading ? "animate-spin" : ""}`}
                />
                Recargar
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`rounded-2xl border px-4 py-3 text-xs font-black uppercase tracking-wider transition ${
                  isActive
                    ? "border-emerald-700 bg-emerald-800 text-white shadow-lg"
                    : "border-slate-200 bg-white text-slate-600 hover:border-emerald-700 hover:text-emerald-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
                }`}
              >
                <Icon size={16} className="mx-auto mb-1" />
                {section.label}
              </button>
            );
          })}
        </div>

        {activeSection === "landing" ? (
          <form
            onSubmit={handleSaveHome}
            className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]"
          >
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <h2 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
                Metadata principal
              </h2>

              <label className="mt-5 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Título SEO
              </label>
              <input
                aria-label="Título SEO"
                value={homeForm.title}
                onChange={(event) =>
                  setHomeForm({ ...homeForm, title: event.target.value })
                }
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
              />
              <FieldHelp value={homeForm.title} min={45} max={65} />

              <label className="mt-5 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Meta description
              </label>
              <textarea
                aria-label="Meta description"
                value={homeForm.description}
                onChange={(event) =>
                  setHomeForm({ ...homeForm, description: event.target.value })
                }
                rows={4}
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
              />
              <FieldHelp value={homeForm.description} min={120} max={160} />

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Canonical URL
                  </span>
                  <input
                    value={homeForm.canonicalUrl || ""}
                    onChange={(event) =>
                      setHomeForm({
                        ...homeForm,
                        canonicalUrl: event.target.value,
                      })
                    }
                    placeholder={SITE_URL}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                  />
                </label>

                <SeoImageManager
                  target="og"
                  value={homeForm.ogImageUrl}
                  placeholder="/uploads/seo/images/archivo.jpg o URL absoluta"
                  isBusy={busyImageTarget === "og"}
                  onUrlChange={(value) =>
                    setHomeForm({
                      ...homeForm,
                      ogImageUrl: value,
                    })
                  }
                  onUpload={handleUploadSeoImage}
                  onDelete={handleDeleteSeoImage}
                />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    OG title
                  </span>
                  <input
                    value={homeForm.ogTitle || ""}
                    onChange={(event) =>
                      setHomeForm({ ...homeForm, ogTitle: event.target.value })
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                  />
                </label>

                <SeoImageManager
                  target="twitter"
                  value={homeForm.twitterImageUrl}
                  placeholder="Vacío usa la imagen OG"
                  isBusy={busyImageTarget === "twitter"}
                  onUrlChange={(value) =>
                    setHomeForm({
                      ...homeForm,
                      twitterImageUrl: value,
                    })
                  }
                  onUpload={handleUploadSeoImage}
                  onDelete={handleDeleteSeoImage}
                />
              </div>

              <label className="mt-5 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                OG description
              </label>
              <textarea
                aria-label="OG description"
                value={homeForm.ogDescription || ""}
                onChange={(event) =>
                  setHomeForm({
                    ...homeForm,
                    ogDescription: event.target.value,
                  })
                }
                rows={3}
                placeholder="Vacío usa la meta description"
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
              />

              <label className="mt-5 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Mensaje de compartir
              </label>
              <textarea
                aria-label="Mensaje de compartir"
                value={homeForm.shareMessage || ""}
                onChange={(event) =>
                  setHomeForm({ ...homeForm, shareMessage: event.target.value })
                }
                rows={3}
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
              />

              <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Frase principal
                  </span>
                  <input
                    value={homeForm.focusKeyword || ""}
                    onChange={(event) =>
                      setHomeForm({
                        ...homeForm,
                        focusKeyword: event.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Frases secundarias
                  </span>
                  <input
                    value={homeForm.secondaryKeywords || ""}
                    onChange={(event) =>
                      setHomeForm({
                        ...homeForm,
                        secondaryKeywords: event.target.value,
                      })
                    }
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                  />
                </label>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold dark:border-slate-800 dark:bg-slate-950">
                  <input
                    type="checkbox"
                    checked={homeForm.robotsIndex}
                    onChange={(event) =>
                      setHomeForm({
                        ...homeForm,
                        robotsIndex: event.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-emerald-700"
                  />
                  Indexar landing pública
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold dark:border-slate-800 dark:bg-slate-950">
                  <input
                    type="checkbox"
                    checked={homeForm.robotsFollow}
                    onChange={(event) =>
                      setHomeForm({
                        ...homeForm,
                        robotsFollow: event.target.checked,
                      })
                    }
                    className="h-4 w-4 accent-emerald-700"
                  />
                  Permitir follow
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-800 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-emerald-900 disabled:opacity-60"
              >
                <Save size={16} />
                {isSubmitting ? "Guardando..." : "Guardar SEO de landing"}
              </button>
            </section>

            <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <h2 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
                Vista previa Google
              </h2>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                <p className="truncate text-xs text-emerald-700 dark:text-emerald-400">
                  {homeForm.canonicalUrl || SITE_URL}
                </p>
                <p className="mt-1 text-lg font-semibold leading-snug text-blue-700 dark:text-blue-400">
                  {homeForm.title || "Título SEO"}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {homeForm.description || "Descripción SEO"}
                </p>
              </div>

              <h2 className="mt-6 text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
                Vista previa social
              </h2>
              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                {resolveSeoPreviewUrl(homeForm.ogImageUrl) ? (
                  <img
                    src={resolveSeoPreviewUrl(homeForm.ogImageUrl) || ""}
                    alt="Vista previa social"
                    className="aspect-video w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-emerald-950 text-center text-xs font-black uppercase tracking-wider text-white/60">
                    Sin imagen OG
                  </div>
                )}
                <div className="p-4">
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {homeForm.ogTitle || homeForm.title}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {homeForm.ogDescription || homeForm.description}
                  </p>
                </div>
              </div>
            </aside>
          </form>
        ) : null}

        {activeSection === "business" ? (
          <form
            onSubmit={handleSaveBusiness}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6"
          >
            <h2 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
              Perfil del negocio para JSON-LD
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                [
                  "businessName",
                  "Nombre comercial",
                  "Amazon Jungle Expeditions",
                ],
                ["legalName", "Razón social", ""],
                ["ruc", "RUC", ""],
                ["phone", "Teléfono", "+51 943214093"],
                ["whatsapp", "WhatsApp", "51943214093"],
                ["email", "Correo", "reservas@dominio.com"],
                ["address", "Dirección", ""],
                ["city", "Ciudad", "Iquitos"],
                ["region", "Región", "Loreto"],
                ["country", "País", "PE"],
                ["latitude", "Latitud", ""],
                ["longitude", "Longitud", ""],
                ["logoUrl", "Logo URL", "/images/logos/Logo-sbg.webp"],
                ["facebookUrl", "Facebook", "https://facebook.com/..."],
                ["instagramUrl", "Instagram", "https://instagram.com/..."],
                ["tiktokUrl", "TikTok", "https://tiktok.com/@..."],
                ["youtubeUrl", "YouTube", "https://youtube.com/..."],
              ].map(([key, label, placeholder]) => (
                <label key={key} className="block">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {label}
                  </span>
                  <input
                    value={String(
                      businessForm[key as keyof SeoBusinessProfilePayload] ||
                        "",
                    )}
                    onChange={(event) =>
                      setBusinessForm({
                        ...businessForm,
                        [key]: event.target.value,
                      })
                    }
                    placeholder={placeholder}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
                  />
                </label>
              ))}
            </div>

            <label className="mt-5 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Descripción del negocio
            </label>
            <textarea
              aria-label="Descripción del negocio"
              value={businessForm.description || ""}
              onChange={(event) =>
                setBusinessForm({
                  ...businessForm,
                  description: event.target.value,
                })
              }
              rows={4}
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-800 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-emerald-900 disabled:opacity-60"
            >
              <Save size={16} />
              {isSubmitting ? "Guardando..." : "Guardar perfil del negocio"}
            </button>
          </form>
        ) : null}

        {activeSection === "faqs" ? (
          <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <form
              onSubmit={handleSaveFaq}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    {editingFaqId ? "Editar FAQ" : "Nueva FAQ"}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Se muestra en la landing y alimenta FAQPage JSON-LD.
                  </p>
                </div>

                {editingFaqId ? (
                  <button
                    type="button"
                    onClick={resetFaqForm}
                    className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-red-600 dark:border-slate-800"
                    aria-label="Cancelar edición"
                  >
                    <X size={16} />
                  </button>
                ) : null}
              </div>

              <label className="mt-5 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Pregunta
              </label>
              <textarea
                aria-label="Pregunta frecuente"
                value={faqForm.question}
                onChange={(event) =>
                  setFaqForm({ ...faqForm, question: event.target.value })
                }
                rows={3}
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
              />

              <label className="mt-5 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Respuesta
              </label>
              <textarea
                aria-label="Respuesta frecuente"
                value={faqForm.answer}
                onChange={(event) =>
                  setFaqForm({ ...faqForm, answer: event.target.value })
                }
                rows={5}
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
              />

              <div className="mt-5 grid grid-cols-2 gap-3">
                <label className="block rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <span className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Orden
                  </span>
                  <input
                    type="number"
                    value={faqForm.position}
                    onChange={(event) =>
                      setFaqForm({
                        ...faqForm,
                        position: Number(event.target.value),
                      })
                    }
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950"
                  />
                </label>

                <label className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 text-sm font-bold dark:border-slate-800">
                  <input
                    type="checkbox"
                    checked={faqForm.isActive}
                    onChange={(event) =>
                      setFaqForm({ ...faqForm, isActive: event.target.checked })
                    }
                    className="h-4 w-4 accent-emerald-700"
                  />
                  Activa
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-800 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-emerald-900 disabled:opacity-60"
              >
                {editingFaqId ? <Save size={16} /> : <Plus size={16} />}
                {isSubmitting
                  ? "Guardando..."
                  : editingFaqId
                    ? "Guardar FAQ"
                    : "Registrar FAQ"}
              </button>
            </form>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <h2 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
                Preguntas frecuentes registradas
              </h2>

              <div className="mt-5 space-y-3">
                {faqs.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm font-semibold text-slate-400 dark:border-slate-700">
                    No hay preguntas frecuentes registradas.
                  </div>
                ) : null}

                {faqs.map((faq) => (
                  <article
                    key={faq.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${faq.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}
                          >
                            {faq.isActive ? "Activa" : "Inactiva"}
                          </span>
                          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-amber-800">
                            Orden {faq.position}
                          </span>
                        </div>
                        <h3 className="mt-3 text-sm font-black text-slate-900 dark:text-white">
                          {faq.question}
                        </h3>
                        <p className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                          {faq.answer}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditFaq(faq)}
                          className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-emerald-700 hover:text-emerald-800 dark:border-slate-800"
                          aria-label="Editar FAQ"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteFaq(faq)}
                          className="grid h-9 w-9 place-items-center rounded-full border border-red-200 text-red-600 transition hover:bg-red-50 dark:border-red-900/40"
                          aria-label="Eliminar FAQ"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {activeSection === "keywords" ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
            <form
              onSubmit={handleSaveKeyword}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
                    {editingKeywordId ? "Editar frase" : "Nueva frase"}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    Son apoyo editorial para búsquedas en español e inglés; el ranking depende del contenido visible, la intención de búsqueda y el SEO técnico. 
                  </p>
                </div>

                {editingKeywordId ? (
                  <button
                    type="button"
                    onClick={resetKeywordForm}
                    className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-red-600 dark:border-slate-800"
                    aria-label="Cancelar edición"
                  >
                    <X size={16} />
                  </button>
                ) : null}
              </div>

              <label className="mt-5 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Palabra o frase objetivo
              </label>
              <textarea
                aria-label="Palabra o frase objetivo"
                value={keywordForm.phrase}
                onChange={(event) =>
                  setKeywordForm({ ...keywordForm, phrase: event.target.value })
                }
                rows={3}
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
              />

              <label className="mt-5 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Fuente
              </label>
              <input
                aria-label="Fuente de la frase objetivo"
                value={keywordForm.source}
                onChange={(event) =>
                  setKeywordForm({ ...keywordForm, source: event.target.value })
                }
                placeholder="WhatsApp, entrevista, Google, recomendación..."
                className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
              />

              <label className="mt-5 block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Notas internas
              </label>
              <textarea
                aria-label="Notas internas de la frase objetivo"
                value={keywordForm.notes}
                onChange={(event) =>
                  setKeywordForm({ ...keywordForm, notes: event.target.value })
                }
                rows={3}
                className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-700/15 dark:border-slate-800 dark:bg-slate-950"
              />

              <label className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold dark:border-slate-800 dark:bg-slate-950">
                <input
                  type="checkbox"
                  checked={keywordForm.isActive}
                  onChange={(event) =>
                    setKeywordForm({
                      ...keywordForm,
                      isActive: event.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-emerald-700"
                />
                Activa como frase objetivo
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-800 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-emerald-900 disabled:opacity-60"
              >
                {editingKeywordId ? <Save size={16} /> : <Plus size={16} />}
                {isSubmitting
                  ? "Guardando..."
                  : editingKeywordId
                    ? "Guardar frase"
                    : "Registrar frase"}
              </button>
            </form>

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6">
              <form
                onSubmit={handleKeywordSearch}
                className="mb-5 flex flex-col gap-3 sm:flex-row"
              >
                <input
                  aria-label="Buscar frase objetivo"
                  type="search"
                  placeholder="Buscar frase objetivo..."
                  value={keywordSearch}
                  onChange={(event) => setKeywordSearch(event.target.value)}
                  className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 transition-colors focus:border-emerald-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                />

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-emerald-800 transition hover:bg-emerald-50 disabled:opacity-60 dark:text-emerald-400"
                >
                  <Search size={15} />
                  Buscar
                </button>
              </form>

              <div className="space-y-3">
                {keywords.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm font-semibold text-slate-400 dark:border-slate-700">
                    No hay frases objetivo registradas.
                  </div>
                ) : null}

                {keywords.map((keyword) => (
                  <article
                    key={keyword.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${keyword.isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"}`}
                          >
                            {keyword.isActive ? "Activa" : "Inactiva"}
                          </span>
                          {keyword.source ? (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                              {keyword.source}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="mt-3 break-words text-sm font-black text-slate-900 dark:text-white">
                          {keyword.phrase}
                        </h3>

                        {keyword.notes ? (
                          <p className="mt-2 break-words text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                            {keyword.notes}
                          </p>
                        ) : null}
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditKeyword(keyword)}
                          className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-emerald-700 hover:text-emerald-800 dark:border-slate-800"
                          aria-label="Editar frase"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleDeleteKeyword(keyword)}
                          className="grid h-9 w-9 place-items-center rounded-full border border-red-200 text-red-600 transition hover:bg-red-50 dark:border-red-900/40"
                          aria-label="Eliminar frase"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SeoKeywordsPage;
