"use client";

import { useEffect, useState } from "react";
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

        <h1 className="mt-4 text-2xl font-black text-blue-900 dark:text-sky-400 uppercase tracking-tight">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Sesión iniciada correctamente en el SGP-CEPS NSS.
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
      </div>
    </div>
  );
};

export default DashboardPage;