"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { resetPassword } from "@/lib/authApi";
import { toast } from "sonner";

const SESSION_HINT_KEY = "sgp_nss_session_hint";

const ResetPasswordPage = () => {
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      const searchParams = new URLSearchParams(window.location.search);
      setToken(searchParams.get("token") || "");
    });
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!token) {
      const message = "El enlace de recuperación no contiene un token válido";
      setError(message);
      toast.error(message);
      return;
    }

    if (password.length < 8) {
      const message = "La nueva contraseña debe tener al menos 8 caracteres";
      setError(message);
      toast.error(message);
      return;
    }

    if (password !== confirmPassword) {
      const message = "Las contraseñas no coinciden";
      setError(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword({
        token,
        password,
        confirmPassword
      });

      window.localStorage.removeItem(SESSION_HINT_KEY);
      setPassword("");
      setConfirmPassword("");
      setSuccessMessage(response.message);
      toast.success(response.message);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo restablecer la contraseña";

      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasToken = token.trim() !== "";

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300 px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-8 lg:p-10 shadow-xl dark:shadow-slate-950/50 transition-all duration-300 animate-fade-in">
        <div className="space-y-5 sm:space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/40 text-blue-900 dark:text-sky-400 font-bold text-[10px] tracking-wide uppercase">
              🛡️ Nueva contraseña
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-blue-900 dark:text-sky-400 tracking-tight uppercase">
              Restablecer contraseña
            </h1>

            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Define una nueva contraseña de acceso. El enlace solo puede usarse mientras esté vigente.
            </p>
          </div>

          {!hasToken && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-700 dark:text-amber-400 text-xs rounded-xl font-medium text-center">
              ⚠️ El enlace de recuperación no contiene un token válido. Solicita un nuevo enlace.
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs rounded-xl font-medium text-center">
              ⚠️ {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs rounded-xl font-medium text-center">
              ✅ {successMessage}. Ya puedes iniciar sesión con tu nueva contraseña.
            </div>
          )}

          {!successMessage && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="reset-password-new"
                  className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Nueva contraseña
                </label>

                <input
                  id="reset-password-new"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-900 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100 transition-colors"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={isSubmitting || !hasToken}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="reset-password-confirm"
                  className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Confirmar contraseña
                </label>

                <input
                  id="reset-password-confirm"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  placeholder="Repite la nueva contraseña"
                  className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-900 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100 transition-colors"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  disabled={isSubmitting || !hasToken}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !hasToken}
                className="w-full mt-2 py-3 bg-blue-900 hover:bg-blue-950 dark:bg-sky-600 dark:hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors duration-200"
              >
                {isSubmitting ? "Restableciendo contraseña..." : "Guardar nueva contraseña"}
              </button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              href="/login"
              className="text-[10px] font-bold uppercase tracking-wider text-blue-900 dark:text-sky-400 hover:underline"
            >
              ← Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
