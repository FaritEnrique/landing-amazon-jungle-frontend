"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { getMe, logout, type AuthUser } from "@/lib/authApi";
import { toast } from "sonner";

const SESSION_HINT_KEY = "sgp_nss_session_hint";
const PUBLIC_PATHS = new Set(["/", "/login"]);

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<AuthUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const role = user?.role;

  useEffect(() => {
    const root = window.document.documentElement;

    if (isDarkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    let isMounted = true;

    const hasSessionHint =
      window.localStorage.getItem(SESSION_HINT_KEY) === "1";

    const shouldCheckSession =
      !PUBLIC_PATHS.has(pathname) || hasSessionHint;

    if (!shouldCheckSession) {
      queueMicrotask(() => {
        if (!isMounted) return;

        setUser(null);
        setIsCheckingSession(false);
      });

      return () => {
        isMounted = false;
      };
    }

    queueMicrotask(() => {
      if (!isMounted) return;

      setIsCheckingSession(true);
    });

    getMe()
      .then((response) => {
        if (!isMounted) return;

        setUser(response.user);
        window.localStorage.setItem(SESSION_HINT_KEY, "1");
      })
      .catch(() => {
        if (!isMounted) return;

        setUser(null);
        window.localStorage.removeItem(SESSION_HINT_KEY);
      })
      .finally(() => {
        if (!isMounted) return;

        setIsCheckingSession(false);
      });

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Sesión cerrada correctamente");
    } catch {
      toast.error("No se pudo cerrar la sesión en el servidor. Se cerrará localmente.");
    } finally {
      setUser(null);
      setIsMenuOpen(false);
      window.localStorage.removeItem(SESSION_HINT_KEY);
      router.push("/login");
      router.refresh();
    }
  };

  const roleLabel = role ? role.split("_").join(" ") : "";

  const roleShortLabel =
    role === "ADMINISTRADOR_SISTEMA"
      ? "SYS"
      : role === "ADMINISTRADOR"
        ? "ADM"
        : role === "OPERADOR"
          ? "OPE"
          : "";

  return (
    <header className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-5 flex items-center justify-between gap-3 sm:gap-4">
        <Link
          href="/"
          className="flex items-center space-x-2.5 sm:space-x-4 group min-w-0"
        >
          <div className="relative w-10 h-12 sm:w-14 sm:h-16 flex-shrink-0 transition-transform group-hover:scale-105 duration-200">
            <Image
              src="/images/logos/logo-sbg.webp"
              alt="Turismo / Amazon Jugle Expedition"
              fill
              priority
              sizes="(max-width: 640px) 40px, 56px"
              className="object-contain dark:brightness-110"
            />
          </div>

          <div className="min-w-0">
            <h1 className="text-[10px] xs:text-xs sm:text-sm font-black text-blue-900 dark:text-sky-400 tracking-tight leading-tight uppercase">
              CEPS PARROQUIAL
              <br className="hidden sm:inline" /> NUESTRA SEÑORA
              <br className="hidden sm:inline" /> DE LA SALUD
            </h1>

            <span className="text-[8px] sm:text-[10px] text-red-600 dark:text-red-400 font-bold block tracking-widest mt-0.5 uppercase truncate">
              Sistema Financiero
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-1.5 sm:space-x-4 flex-shrink-0">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            type="button"
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200"
            aria-label="Cambiar tema de pantalla"
          >
            {isDarkMode ? (
              <svg
                className="h-5 w-5 text-amber-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707m12.728 5.657a9 9 0 11-12.728 0 9 9 0 0112.728 0z"
                />
              </svg>
            ) : (
              <svg
                className="h-5 w-5 text-slate-700"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                />
              </svg>
            )}
          </button>

          {isCheckingSession ? (
            <div className="hidden sm:block px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
              Verificando...
            </div>
          ) : user ? (
            <div className="hidden md:flex items-center space-x-2 sm:space-x-3 bg-blue-50/80 dark:bg-slate-800 px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-blue-100 dark:border-slate-700">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />

              <div className="text-left hidden sm:block">
                <span className="text-[9px] text-slate-500 dark:text-slate-400 block font-bold uppercase tracking-wider">
                  Rol Activo
                </span>

                <span className="text-xs font-black text-blue-900 dark:text-sky-400 tracking-wide block truncate max-w-[140px] lg:max-w-[180px]">
                  {roleLabel}
                </span>
              </div>

              <span className="text-[11px] font-black text-blue-900 dark:text-sky-400 block sm:hidden">
                {roleShortLabel}
              </span>

              <button
                onClick={handleLogout}
                type="button"
                className="text-[11px] sm:text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-bold pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-700 ml-1 transition-colors"
              >
                Salir
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden sm:inline-flex bg-blue-900 dark:bg-sky-600 text-white hover:bg-blue-950 dark:hover:bg-sky-700 transition-colors px-4 py-2 rounded-xl font-bold text-xs tracking-wider shadow-sm"
            >
              INGRESAR
            </Link>
          )}

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            type="button"
            className="inline-flex items-center justify-center p-2 rounded-xl text-blue-900 dark:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none md:hidden transition-colors"
            aria-label="Menú"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      <div className="hidden md:block bg-gradient-to-r from-blue-900 via-blue-800 to-sky-950 dark:from-slate-900 dark:via-slate-800 dark:to-slate-950 text-white border-t dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-11 flex items-center justify-between text-xs font-semibold">
          <nav className="flex space-x-6">
            <Link
              href="/"
              className="hover:text-sky-300 dark:hover:text-sky-400 transition-colors py-1 border-b-2 border-transparent hover:border-sky-400"
            >
              Inicio
            </Link>

            {user && role !== "ADMINISTRADOR_SISTEMA" && (
              <Link
                href="#"
                className="hover:text-sky-300 dark:hover:text-sky-400 transition-colors py-1 border-b-2 border-transparent hover:border-sky-400"
              >
                Registro Real de Caja
              </Link>
            )}

            {user && role === "ADMINISTRADOR" && (
              <Link
                href="#"
                className="text-sky-200 dark:text-slate-300 hover:text-white transition-colors py-1 border-b-2 border-transparent hover:border-sky-400 flex items-center gap-1"
              >
                ⚙️ Proyecciones Presupuestales
              </Link>
            )}

            {user && role === "ADMINISTRADOR_SISTEMA" && (
              <Link
                href="#"
                className="text-amber-300 dark:text-amber-400 hover:text-white transition-colors py-1 border-b-2 border-transparent hover:border-amber-400 flex items-center gap-1"
              >
                🛠️ Panel de Auditoría y Usuarios
              </Link>
            )}
          </nav>

          {user && (
            <div className="text-[10px] text-sky-200 dark:text-slate-400 bg-blue-950/50 dark:bg-slate-900/50 px-2.5 py-1 rounded border border-blue-700/30 dark:border-slate-800 max-w-[240px] truncate">
              {user.fullName}
            </div>
          )}
        </div>
      </div>

      {isMenuOpen && (
        <div className="absolute top-full left-0 w-full bg-slate-900 dark:bg-slate-950 text-white border-t border-slate-800 shadow-2xl z-50 md:hidden animate-fade-in">
          <div className="px-4 pt-3 pb-5 space-y-2 text-sm font-medium">
            <Link
              href="/"
              onClick={() => setIsMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Inicio
            </Link>

            {!user && (
              <Link
                href="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sky-300 hover:bg-slate-800 transition-colors font-bold"
              >
                Ingresar
              </Link>
            )}

            {user && role !== "ADMINISTRADOR_SISTEMA" && (
              <Link
                href="#"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl hover:bg-slate-800 transition-colors"
              >
                Registro Real de Caja
              </Link>
            )}

            {user && role === "ADMINISTRADOR" && (
              <Link
                href="#"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-sky-300 hover:bg-slate-800 transition-colors font-bold"
              >
                ⚙️ Proyecciones Presupuestales
              </Link>
            )}

            {user && role === "ADMINISTRADOR_SISTEMA" && (
              <Link
                href="#"
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-2.5 rounded-xl text-amber-400 hover:bg-slate-800 transition-colors font-bold"
              >
                🛠️ Panel de Auditoría
              </Link>
            )}

            {user && (
              <button
                onClick={handleLogout}
                type="button"
                className="w-full text-left px-3 py-2.5 rounded-xl text-red-300 hover:bg-slate-800 transition-colors font-bold"
              >
                Salir
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;