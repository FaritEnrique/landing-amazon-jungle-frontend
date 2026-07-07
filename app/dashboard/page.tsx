"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getMe, type AuthUser } from "@/lib/authApi";

const DashboardPage = () => {
  const router = useRouter();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getMe()
      .then((response) => {
        if (!isMounted) return;
        setUser(response.user);
      })
      .catch(() => {
        if (!isMounted) return;
        router.replace("/login");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsChecking(false);
      });

    return () => {
      isMounted = false;
    };
  }, [router]);

  if (isChecking) {
    return (
      <div className="min-h-[70vh] bg-slate-50 dark:bg-slate-950 px-4 py-10 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl text-center">
          <div className="text-2xl mb-3">⏳</div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Validando sesión...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-[70vh] bg-slate-50 dark:bg-slate-950 px-4 py-10">
      <div className="max-w-7xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        <div className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-400 font-bold text-[10px] tracking-wide uppercase">
          Sesión activa
        </div>

        <h1 className="mt-4 text-2xl font-black text-emerald-900 dark:text-emerald-400 uppercase tracking-tight">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Sesión iniciada correctamente en el Amazon Jungle Expeditions.
        </p>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Usuario
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">
              {user.fullName}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Rol
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">
              {user.role.split("_").join(" ")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Área
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800 dark:text-slate-100">
              {user.area}
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 dark:border-emerald-900/40 dark:bg-emerald-950/30">
            <h2 className="text-sm font-black uppercase tracking-tight text-emerald-950 dark:text-emerald-400">
              SEO de la landing
            </h2>

            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Administra metadata, Open Graph, perfil del negocio, FAQs y frases
              objetivo de la única landing pública.
            </p>

            <Link
              href="/dashboard/seo"
              className="mt-4 inline-flex rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-emerald-900"
            >
              Gestionar SEO
            </Link>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
            <h2 className="text-sm font-black uppercase tracking-tight text-amber-950 dark:text-amber-300">
              Carrusel principal
            </h2>

            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Administra las imágenes de fondo, textos, botones y orden del hero
              superior de la landing.
            </p>

            <Link
              href="/dashboard/hero-carousel"
              className="mt-4 inline-flex rounded-xl bg-amber-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-emerald-950 transition hover:bg-amber-400"
            >
              Gestionar carrusel
            </Link>
          </div>

          <div className="rounded-2xl border border-lime-100 bg-lime-50 p-4 dark:border-lime-900/40 dark:bg-lime-950/20">
            <h2 className="text-sm font-black uppercase tracking-tight text-lime-950 dark:text-lime-300">
              Paquetes turísticos
            </h2>

            <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              Administra las imágenes WebP, textos sobre fotografía, precios y
              contenido inferior de los tours.
            </p>

            <Link
              href="/dashboard/tour-packages"
              className="mt-4 inline-flex rounded-xl bg-lime-600 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-lime-700"
            >
              Gestionar paquetes
            </Link>
          </div>

          {user.role === "ADMINISTRADOR_SISTEMA" ? (
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-900/40 dark:bg-blue-950/20">
              <h2 className="text-sm font-black uppercase tracking-tight text-blue-950 dark:text-blue-300">
                Usuarios y roles
              </h2>

              <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                Crea operadores para que puedan editar SEO, carrusel y paquetes turísticos sin acceder a la gestión de usuarios.
              </p>

              <Link
                href="/dashboard/users"
                className="mt-4 inline-flex rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-black uppercase tracking-wider text-white transition hover:bg-blue-800"
              >
                Gestionar usuarios
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
