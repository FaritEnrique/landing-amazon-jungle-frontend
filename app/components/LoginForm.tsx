"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { login } from "@/lib/authApi";
import { toast } from "sonner";

const SESSION_HINT_KEY = "landing_amazon_jungle_session_hint";

const LoginForm = () => {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      const message =
        error instanceof Error ? error.message : "No se pudo iniciar sesión";

      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 py-1 sm:space-y-6 sm:py-2">
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400">
          🔑 Acceso Autenticado
        </div>

        <h2 className="text-xl font-black uppercase tracking-tight text-emerald-900 sm:text-2xl dark:text-emerald-400">
          Intranet
        </h2>

        <p className="mx-auto max-w-xs text-[11px] text-slate-500 sm:text-xs dark:text-slate-400">
          Amazon Jungle Expeditions — Panel de administración.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-center text-xs font-medium text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-400">
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
            placeholder="admin@amazonjungle-expeditions.com"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs text-slate-900 transition-colors focus:border-emerald-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="login-password"
              className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400"
            >
              Contraseña de Acceso
            </label>

            <Link
              href="/forgot-password"
              className="whitespace-nowrap text-[10px] font-bold text-emerald-800 hover:underline dark:text-emerald-400"
            >
              ¿Olvidó su contraseña?
            </Link>
          </div>

          <div className="relative">
            <input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pr-10 text-xs text-slate-900 transition-colors focus:border-emerald-800 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
            />

            <button
              type="button"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              onClick={() => setShowPassword((current) => !current)}
              disabled={isSubmitting}
              className="absolute inset-y-0 right-3 grid place-items-center text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-xl bg-emerald-800 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors duration-200 hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-700"
        >
          {isSubmitting ? "Validando acceso..." : "Ingresar al Panel 🔑"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
