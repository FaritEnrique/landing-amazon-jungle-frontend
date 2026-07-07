"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import {
  createUser,
  getMe,
  listUsers,
  updateUserStatus,
  type AuthRole,
  type AuthUser,
} from "@/lib/authApi";

type UserFormState = {
  fullName: string;
  dni: string;
  area: string;
  email: string;
  role: AuthRole;
  password: string;
  confirmPassword: string;
};

const emptyForm: UserFormState = {
  fullName: "",
  dni: "",
  area: "Contenido digital",
  email: "",
  role: "OPERADOR",
  password: "",
  confirmPassword: "",
};

const formatRole = (role: AuthRole) => role.split("_").join(" ");

const UsersDashboardPage = () => {
  const router = useRouter();

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [form, setForm] = useState<UserFormState>(emptyForm);
  const [isChecking, setIsChecking] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeError, setActiveError] = useState("");

  const canManageUsers = currentUser?.role === "ADMINISTRADOR_SISTEMA";

  const activeOperators = useMemo(() => {
    return users.filter((user) => user.role === "OPERADOR" && user.isActive).length;
  }, [users]);

  const activeAdmins = useMemo(() => {
    return users.filter(
      (user) => user.role === "ADMINISTRADOR_SISTEMA" && user.isActive,
    ).length;
  }, [users]);

  const loadUsers = async () => {
    setIsLoadingUsers(true);
    setActiveError("");

    try {
      const response = await listUsers();
      setUsers(response.users);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo listar usuarios";
      setActiveError(message);
      toast.error(message);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    getMe()
      .then((response) => {
        if (!isMounted) return;

        setCurrentUser(response.user);

        if (response.user.role !== "ADMINISTRADOR_SISTEMA") {
          router.replace("/dashboard");
          return;
        }

        void loadUsers();
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

  const handleChange = <K extends keyof UserFormState>(
    field: K,
    value: UserFormState[K],
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setActiveError("");

    if (!canManageUsers) {
      toast.error("Solo el administrador del sistema puede crear usuarios");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await createUser(form);
      setUsers((current) => [...current, response.user]);
      setForm(emptyForm);
      toast.success(response.message);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "No se pudo crear usuario";
      setActiveError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: AuthUser) => {
    if (!canManageUsers) return;

    try {
      const response = await updateUserStatus(user.id, !user.isActive);
      setUsers((current) =>
        current.map((item) => (item.id === response.user.id ? response.user : item)),
      );
      toast.success(response.message);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el estado del usuario";
      toast.error(message);
    }
  };

  if (isChecking) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4 py-10 dark:bg-slate-950">
        <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900">
          <Loader2 className="mx-auto animate-spin text-emerald-700" size={28} />
          <p className="mt-3 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Validando permisos...
          </p>
        </div>
      </div>
    );
  }

  if (!canManageUsers) {
    return null;
  }

  return (
    <div className="min-h-[70vh] bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-emerald-800 transition hover:text-emerald-950 dark:text-emerald-400"
            >
              <ArrowLeft size={16} />
              Volver al dashboard
            </Link>

            <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-400">
              <ShieldCheck size={13} />
              Solo ADMINISTRADOR_SISTEMA
            </div>

            <h1 className="mt-4 text-2xl font-black uppercase tracking-tight text-emerald-950 dark:text-emerald-400">
              Gestión de usuarios
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 dark:text-slate-400">
              Crea operadores para que puedan editar SEO, carrusel principal y
              paquetes turísticos. Solo el administrador del sistema puede crear,
              activar o desactivar cuentas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadUsers()}
            disabled={isLoadingUsers}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-slate-950"
          >
            <RefreshCw size={16} className={isLoadingUsers ? "animate-spin" : ""} />
            Actualizar
          </button>
        </div>

        {activeError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {activeError}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-5 dark:border-emerald-900/40 dark:bg-emerald-950/30">
            <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
              Total usuarios
            </p>
            <p className="mt-2 text-3xl font-black text-emerald-950 dark:text-white">
              {users.length}
            </p>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/40 dark:bg-blue-950/30">
            <p className="text-[10px] font-black uppercase tracking-wider text-blue-800 dark:text-blue-300">
              Administradores activos
            </p>
            <p className="mt-2 text-3xl font-black text-blue-950 dark:text-white">
              {activeAdmins}
            </p>
          </div>

          <div className="rounded-3xl border border-lime-100 bg-lime-50 p-5 dark:border-lime-900/40 dark:bg-lime-950/30">
            <p className="text-[10px] font-black uppercase tracking-wider text-lime-800 dark:text-lime-300">
              Operadores activos
            </p>
            <p className="mt-2 text-3xl font-black text-lime-950 dark:text-white">
              {activeOperators}
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form
            onSubmit={handleCreateUser}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
                <Plus size={22} />
              </div>
              <div>
                <h2 className="text-base font-black uppercase tracking-tight text-slate-950 dark:text-white">
                  Crear usuario
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Define rol, datos de acceso y contraseña inicial.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Nombre completo
                </span>
                <input
                  required
                  minLength={3}
                  value={form.fullName}
                  onChange={(event) => handleChange("fullName", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950"
                  placeholder="Ej. Operador de contenidos"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  DNI
                </span>
                <input
                  required
                  pattern="\d{8}"
                  maxLength={8}
                  value={form.dni}
                  onChange={(event) => handleChange("dni", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950"
                  placeholder="8 dígitos"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Área
                </span>
                <input
                  required
                  minLength={3}
                  value={form.area}
                  onChange={(event) => handleChange("area", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950"
                  placeholder="Contenido digital"
                />
              </label>

              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Correo electrónico
                </span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange("email", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950"
                  placeholder="operador@dominio.com"
                />
              </label>

              <label className="space-y-1.5 sm:col-span-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Rol
                </span>
                <select
                  value={form.role}
                  onChange={(event) => handleChange("role", event.target.value as AuthRole)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950"
                >
                  <option value="OPERADOR">OPERADOR</option>
                  <option value="ADMINISTRADOR_SISTEMA">ADMINISTRADOR_SISTEMA</option>
                </select>
              </label>

              <label className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Contraseña
                </span>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={form.password}
                  onChange={(event) => handleChange("password", event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950"
                  placeholder="Mínimo 8 caracteres"
                />
              </label>

              <label className="space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Confirmar contraseña
                </span>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={form.confirmPassword}
                  onChange={(event) =>
                    handleChange("confirmPassword", event.target.value)
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-emerald-700 dark:border-slate-800 dark:bg-slate-950"
                  placeholder="Repite la contraseña"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-xs font-black uppercase tracking-wider text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <UserCog size={16} />}
              {isSubmitting ? "Creando usuario..." : "Crear usuario"}
            </button>
          </form>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100">
                  <Users size={22} />
                </div>
                <div>
                  <h2 className="text-base font-black uppercase tracking-tight text-slate-950 dark:text-white">
                    Usuarios registrados
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Estado operativo de las cuentas del dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {users.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500 dark:border-slate-800">
                  Aún no hay usuarios para mostrar.
                </div>
              ) : (
                users.map((user) => {
                  const isCurrentUser = user.id === currentUser?.id;

                  return (
                    <article
                      key={user.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-black text-slate-950 dark:text-white">
                              {user.fullName}
                            </h3>
                            {isCurrentUser ? (
                              <span className="rounded-full bg-blue-100 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                                Tu cuenta
                              </span>
                            ) : null}
                            <span
                              className={[
                                "rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-wider",
                                user.isActive
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                  : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
                              ].join(" ")}
                            >
                              {user.isActive ? "Activo" : "Inactivo"}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {user.email} · DNI {user.dni} · {user.area}
                          </p>

                          <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-white px-2 py-1 text-[10px] font-black uppercase tracking-wider text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:ring-slate-800">
                            <BadgeCheck size={12} />
                            {formatRole(user.role)}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => void handleToggleStatus(user)}
                          disabled={isCurrentUser}
                          className={[
                            "rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wider transition disabled:cursor-not-allowed disabled:opacity-40",
                            user.isActive
                              ? "bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-300"
                              : "bg-emerald-700 text-white hover:bg-emerald-800",
                          ].join(" ")}
                        >
                          {user.isActive ? "Desactivar" : "Activar"}
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default UsersDashboardPage;
