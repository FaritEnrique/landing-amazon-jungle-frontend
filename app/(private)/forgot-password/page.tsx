"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotPassword } from "@/lib/authApi";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await forgotPassword({ email });
      setSuccessMessage(response.message);
      toast.success(response.message);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo procesar la recuperación de contraseña";

      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300 px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="w-full max-w-md mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-8 lg:p-10 shadow-xl dark:shadow-slate-950/50 transition-all duration-300 animate-fade-in">
        <div className="space-y-5 sm:space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/40 text-blue-900 dark:text-sky-400 font-bold text-[10px] tracking-wide uppercase">
              🔐 Recuperación de acceso
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-blue-900 dark:text-sky-400 tracking-tight uppercase">
              Olvidé mi contraseña
            </h1>

            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Ingresa tu correo institucional. Si existe una cuenta asociada, enviaremos un enlace para restablecer la contraseña.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs rounded-xl font-medium text-center">
              ⚠️ {error}
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs rounded-xl font-medium text-center">
              ✅ {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="forgot-password-email"
                className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400"
              >
                Correo Electrónico
              </label>

              <input
                id="forgot-password-email"
                name="email"
                type="email"
                required
                autoComplete="username"
                placeholder="usuario@cepsnss.edu.pe"
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-900 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100 transition-colors"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 bg-blue-900 hover:bg-blue-950 dark:bg-sky-600 dark:hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors duration-200"
            >
              {isSubmitting ? "Enviando instrucciones..." : "Enviar enlace de recuperación"}
            </button>
          </form>

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

export default ForgotPasswordPage;
