"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/authApi";
import { toast } from "sonner";

const SESSION_HINT_KEY = "sgp_nss_session_hint";

const LoginForm = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login({ email, password });
      window.localStorage.setItem(SESSION_HINT_KEY, "1");
      toast.success("Inicio de sesión correcto");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo iniciar sesión";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6 py-1 sm:py-2">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/40 text-blue-900 dark:text-sky-400 font-bold text-[10px] tracking-wide uppercase">
          🔑 Acceso Autenticado
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-blue-900 dark:text-sky-400 tracking-tight uppercase">
          Iniciar Sesión
        </h2>

        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
          SGP-CEPS NSS — Control de Accesos Multi-Rol.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs rounded-xl font-medium text-center">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleLoginSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label
            htmlFor="login-email"
            className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400"
          >
            Correo Electrónico
          </label>

          <input
            id="login-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            placeholder="usuario@cepsnss.edu.pe"
            className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-900 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100 transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center gap-3">
            <label
              htmlFor="login-password"
              className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400"
            >
              Contraseña de Acceso
            </label>

            <Link
              href="/forgot-password"
              className="text-[10px] font-bold text-blue-900 dark:text-sky-400 hover:underline whitespace-nowrap"
            >
              ¿Olvidó su contraseña?
            </Link>
          </div>

          <input
            id="login-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-900 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100 transition-colors"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full mt-2 py-3 bg-blue-900 hover:bg-blue-950 dark:bg-sky-600 dark:hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors duration-200"
        >
          {isSubmitting ? "Validando acceso..." : "Ingresar al Panel 🔑"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;