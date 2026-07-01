"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { bootstrapSystemAdmin } from "@/lib/authApi";
import { toast } from "sonner";

const SESSION_HINT_KEY = "landing_amazon_jungle_session_hint";

const RegisterSystemAdminForm = ({
  onRegistryComplete,
}: {
  onRegistryComplete: () => void;
}) => {
  const [formData, setFormData] = useState({
    fullName: "",
    dni: "",
    area: "Sistemas / TI",
    roleName: "ADMINISTRADOR_SISTEMA",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.dni.length !== 8 || Number.isNaN(Number(formData.dni))) {
      const message = "El DNI debe contener exactamente 8 dígitos numéricos.";
      setError(message);
      toast.error(message);
      return;
    }

    if (formData.password.length < 8) {
      const message = "La contraseña debe tener al menos 8 caracteres.";
      setError(message);
      toast.error(message);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const message = "Las contraseñas no coinciden. Verifique los campos.";
      setError(message);
      toast.error(message);
      return;
    }

    setIsSubmitting(true);

    try {
      await bootstrapSystemAdmin({
        fullName: formData.fullName,
        dni: formData.dni,
        area: formData.area,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      window.localStorage.setItem(SESSION_HINT_KEY, "1");
      toast.success("Cuenta raíz configurada correctamente");
      onRegistryComplete();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo configurar la cuenta raíz";

      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-400 font-bold text-[10px] tracking-wide uppercase">
          🛡️ Inicialización de Infraestructura
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-blue-900 dark:text-sky-400 tracking-tight uppercase wrap-break-word">
          ADMINISTRADOR_SISTEMA
        </h2>

        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
          Base de datos vacía. El primer registro configurará la cuenta raíz con
          el rol técnico de <strong>ADMINISTRADOR_SISTEMA</strong>.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs rounded-xl font-medium text-center">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="bootstrap-full-name"
              className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400"
            >
              Nombre Completo
            </label>

            <input
              id="bootstrap-full-name"
              name="fullName"
              type="text"
              required
              autoComplete="name"
              placeholder="Ej. Carlos Mendoza"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-900 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100 transition-colors"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="bootstrap-dni"
              className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400"
            >
              DNI (8 dígitos)
            </label>

            <input
              id="bootstrap-dni"
              name="dni"
              type="text"
              inputMode="numeric"
              maxLength={8}
              required
              autoComplete="off"
              placeholder="Escriba su DNI"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-900 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100 transition-colors"
              value={formData.dni}
              onChange={(e) => {
                const dni = e.target.value.replace(/\D/g, "");
                setFormData({ ...formData, dni });
              }}
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label
              htmlFor="bootstrap-area"
              className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500"
            >
              Área Asignada
            </label>

            <input
              id="bootstrap-area"
              name="area"
              type="text"
              readOnly
              autoComplete="organization"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed focus:outline-none"
              value={formData.area}
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="bootstrap-role"
              className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500"
            >
              Cargo por Defecto
            </label>

            <input
              id="bootstrap-role"
              name="roleName"
              type="text"
              readOnly
              autoComplete="off"
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed focus:outline-none"
              value={formData.roleName}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="bootstrap-email"
            className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400"
          >
            Correo Electrónico Institucional
          </label>

          <input
            id="bootstrap-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            placeholder="tucorreo@example.com"
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-blue-900 dark:focus:border-sky-500 text-slate-900 dark:text-slate-100 transition-colors"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            disabled={isSubmitting}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label
              htmlFor="bootstrap-password"
              className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400"
            >
              Contraseña
            </label>

            <div className="relative">
              <input
                id="bootstrap-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-10 text-xs text-slate-900 transition-colors focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-500"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
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

          <div className="space-y-1.5">
            <label
              htmlFor="bootstrap-confirm-password"
              className="text-[10px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400"
            >
              Confirmar Contraseña
            </label>

            <div className="relative">
              <input
                id="bootstrap-confirm-password"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 pr-10 text-xs text-slate-900 transition-colors focus:border-blue-900 focus:outline-none dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-sky-500"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  })
                }
                disabled={isSubmitting}
              />

              <button
                type="button"
                aria-label={
                  showConfirmPassword
                    ? "Ocultar confirmación de contraseña"
                    : "Mostrar confirmación de contraseña"
                }
                onClick={() => setShowConfirmPassword((current) => !current)}
                disabled={isSubmitting}
                className="absolute inset-y-0 right-3 grid place-items-center text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:hover:text-slate-200"
              >
                {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 w-full rounded-xl bg-amber-600 py-3 text-xs font-black uppercase tracking-wider text-white shadow-md transition-colors duration-200 hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting
            ? "Configurando cuenta raíz..."
            : "Asignar ADMINISTRADOR_SISTEMA 🛠️"}
        </button>
      </form>
    </div>
  );
};

export default RegisterSystemAdminForm;
