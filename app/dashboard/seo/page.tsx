"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Pencil, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { getMe } from "@/lib/authApi";
import {
  createSeoKeyword,
  deleteSeoKeyword,
  listSeoKeywords,
  updateSeoKeyword,
  type SeoKeyword,
} from "@/lib/seoApi";

const emptyForm = {
  phrase: "",
  source: "",
  notes: "",
  isActive: true,
};

const SeoKeywordsPage = () => {
  const router = useRouter();

  const [keywords, setKeywords] = useState<SeoKeyword[]>([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [formData, setFormData] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const activeCount = useMemo(() => {
    return keywords.filter((keyword) => keyword.isActive).length;
  }, [keywords]);

  const loadKeywords = async (q = search) => {
    setIsLoading(true);

    try {
      const response = await listSeoKeywords({
        q,
        includeInactive: true,
      });

      setKeywords(response.keywords);
      setTotal(response.total);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cargar las palabras clave";

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
        void loadKeywords("");
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
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formData.phrase.trim()) {
      toast.error("Ingrese una palabra o frase clave");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        phrase: formData.phrase,
        source: formData.source || null,
        notes: formData.notes || null,
        isActive: formData.isActive,
      };

      if (editingId) {
        await updateSeoKeyword(editingId, payload);
        toast.success("Palabra o frase clave actualizada");
      } else {
        await createSeoKeyword(payload);
        toast.success("Palabra o frase clave registrada");
      }

      resetForm();
      await loadKeywords();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo guardar la palabra o frase clave";

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (keyword: SeoKeyword) => {
    setEditingId(keyword.id);
    setFormData({
      phrase: keyword.phrase,
      source: keyword.source || "",
      notes: keyword.notes || "",
      isActive: keyword.isActive,
    });
  };

  const handleDelete = async (keyword: SeoKeyword) => {
    const shouldDelete = window.confirm(
      `¿Eliminar la palabra o frase clave "${keyword.phrase}"?`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      await deleteSeoKeyword(keyword.id);
      toast.success("Palabra o frase clave eliminada");
      await loadKeywords();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo eliminar la palabra o frase clave";

      toast.error(message);
    }
  };

  const handleToggleStatus = async (keyword: SeoKeyword) => {
    try {
      await updateSeoKeyword(keyword.id, {
        phrase: keyword.phrase,
        source: keyword.source,
        notes: keyword.notes,
        isActive: !keyword.isActive,
      });

      toast.success(
        !keyword.isActive
          ? "Palabra o frase clave activada"
          : "Palabra o frase clave desactivada"
      );

      await loadKeywords();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado";

      toast.error(message);
    }
  };

  const handleSearchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await loadKeywords(search);
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
    <div className="min-h-[70vh] bg-slate-50 px-4 py-8 dark:bg-slate-950 sm:py-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-slate-600 transition hover:border-emerald-700 hover:text-emerald-800 dark:border-slate-800 dark:text-slate-400 dark:hover:text-emerald-400"
            >
              <ArrowLeft size={14} />
              Volver al dashboard
            </Link>

            <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400">
              SEO dinámico
            </div>

            <h1 className="mt-3 text-2xl font-black uppercase tracking-tight text-emerald-950 dark:text-emerald-400 sm:text-3xl">
              Palabras y frases clave
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Registre las palabras, frases y formas reales en que los clientes
              dicen haber encontrado el albergue. Las frases activas alimentan
              las metas SEO públicas de la landing.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-64">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Total
              </p>
              <p className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {total}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Activas
              </p>
              <p className="mt-1 text-2xl font-black text-emerald-800 dark:text-emerald-400">
                {activeCount}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,420px)_1fr]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white">
                  {editingId ? "Editar frase" : "Nueva frase"}
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  No hay límite de registros. Use frases naturales, tal como las
                  mencione el cliente.
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:text-red-600 dark:border-slate-800"
                  aria-label="Cancelar edición"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="seo-phrase"
                  className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Palabra o frase clave
                </label>

                <textarea
                  id="seo-phrase"
                  name="phrase"
                  required
                  rows={3}
                  placeholder="Ej. tours privados en la selva de Iquitos"
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-900 transition-colors focus:border-emerald-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500"
                  value={formData.phrase}
                  onChange={(event) =>
                    setFormData({ ...formData, phrase: event.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="seo-source"
                  className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Fuente o contexto
                </label>

                <input
                  id="seo-source"
                  name="source"
                  type="text"
                  placeholder="Ej. Entrevista a cliente, WhatsApp, Google, recomendación"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 transition-colors focus:border-emerald-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500"
                  value={formData.source}
                  onChange={(event) =>
                    setFormData({ ...formData, source: event.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="seo-notes"
                  className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Notas internas
                </label>

                <textarea
                  id="seo-notes"
                  name="notes"
                  rows={3}
                  placeholder="Ej. Cliente indicó que buscó paquetes de 3 días y 2 noches"
                  className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-900 transition-colors focus:border-emerald-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500"
                  value={formData.notes}
                  onChange={(event) =>
                    setFormData({ ...formData, notes: event.target.value })
                  }
                  disabled={isSubmitting}
                />
              </div>

              <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                <span>Usar en metadata SEO pública</span>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(event) =>
                    setFormData({ ...formData, isActive: event.target.checked })
                  }
                  disabled={isSubmitting}
                  className="h-4 w-4 accent-emerald-700"
                />
              </label>

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {editingId ? <Save size={16} /> : <Plus size={16} />}
                {isSubmitting
                  ? "Guardando..."
                  : editingId
                    ? "Guardar cambios"
                    : "Registrar frase clave"}
              </button>
            </form>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-6">
            <form
              onSubmit={handleSearchSubmit}
              className="mb-5 flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="search"
                placeholder="Buscar por palabra o frase..."
                className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 transition-colors focus:border-emerald-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-700 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-emerald-800 transition hover:bg-emerald-50 disabled:opacity-60 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
              >
                <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
                Buscar
              </button>
            </form>

            {keywords.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
                  Todavía no hay palabras o frases clave.
                </p>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  Registre las primeras frases según las entrevistas y consultas
                  reales de los clientes.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {keywords.map((keyword) => (
                  <article
                    key={keyword.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${
                              keyword.isActive
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                            }`}
                          >
                            {keyword.isActive ? "Activa" : "Inactiva"}
                          </span>

                          {keyword.source && (
                            <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                              {keyword.source}
                            </span>
                          )}
                        </div>

                        <h3 className="mt-3 wrap-break-word text-sm font-black text-slate-900 dark:text-white">
                          {keyword.phrase}
                        </h3>

                        {keyword.notes && (
                          <p className="mt-2 wrap-break-word text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                            {keyword.notes}
                          </p>
                        )}

                        <p className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                          Actualizado: {new Date(keyword.updatedAt).toLocaleDateString("es-PE")}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(keyword)}
                          className="rounded-full border border-slate-200 px-3 py-2 text-[10px] font-black uppercase tracking-wide text-slate-600 transition hover:border-emerald-700 hover:text-emerald-800 dark:border-slate-800 dark:text-slate-300"
                        >
                          {keyword.isActive ? "Desactivar" : "Activar"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleEdit(keyword)}
                          className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:border-emerald-700 hover:text-emerald-800 dark:border-slate-800 dark:text-slate-300"
                          aria-label="Editar palabra o frase clave"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(keyword)}
                          className="grid h-9 w-9 place-items-center rounded-full border border-red-200 text-red-600 transition hover:bg-red-50 dark:border-red-900/40 dark:hover:bg-red-950/30"
                          aria-label="Eliminar palabra o frase clave"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default SeoKeywordsPage;
