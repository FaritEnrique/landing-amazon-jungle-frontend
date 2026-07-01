"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import RegisterSystemAdminForm from "../components/RegisterSystemAdminForm";
import LoginForm from "../components/LoginForm";
import { getBootstrapStatus } from "@/lib/authApi";

const LoginPage = () => {
  const router = useRouter();

  const [hasUsers, setHasUsers] = useState<boolean | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getBootstrapStatus()
      .then((status) => {
        if (!isMounted) return;

        setHasUsers(status.hasUsers);
      })
      .catch((error) => {
        if (!isMounted) return;

        setError(
          error instanceof Error
            ? error.message
            : "No se pudo verificar el estado del sistema"
        );

        setHasUsers(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRegistryComplete = () => {
    setHasUsers(true);
    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300 px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
      <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 sm:p-8 lg:p-10 shadow-xl dark:shadow-slate-950/50 transition-all duration-300 animate-fade-in">
        {hasUsers === null ? (
          <div className="text-center space-y-3 py-10">
            <div className="text-2xl">⏳</div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Verificando estado del sistema...
            </p>
          </div>
        ) : error ? (
          <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-red-700 dark:text-red-400 text-xs rounded-xl font-medium text-center">
            ⚠️ {error}
          </div>
        ) : !hasUsers ? (
          <RegisterSystemAdminForm onRegistryComplete={handleRegistryComplete} />
        ) : (
          <div className="max-w-md mx-auto">
            <LoginForm />
          </div>
        )}

        <div className="mt-6 sm:mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col xs:flex-row gap-2 xs:items-center xs:justify-between text-[10px] text-slate-400">
          <span>⚙️ Estado de la Base de Datos:</span>

          <span className="w-fit px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold uppercase transition-colors">
            {hasUsers === null
              ? "Verificando"
              : hasUsers
                ? "Con usuarios"
                : "Vacía"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;