"use client";

import Image from "next/image";
import Link from "next/link";

const Home = () => {
  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">

      {/* Contenedor Principal con Grid Adaptativo */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center animate-fade-in">

        {/* Columna Izquierda: Información y Acciones */}
        <div className="md:col-span-7 space-y-6 text-center sm:text-left">

          <div className="space-y-3">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight uppercase">
              Gestión Transparente,<br />
              <span className="text-blue-900 dark:text-sky-400">Futuro Sostenible.</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 font-medium max-w-xl">
              Sistema Integral de Proyección y Registro de Ingresos y Gastos (SGP-CEPS NSS)
            </p>
          </div>

          {/* Botón de Ingreso Principal apuntando a la ruta de login */}
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 dark:bg-sky-600 dark:hover:bg-sky-700 text-white font-black text-sm uppercase tracking-wider px-6 py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
            >
              Ingresar al Sistema 🔑
            </Link>
          </div>

          {/* Separador Interno de Sección */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800" />

          {/* Bloque de Compromiso Institucional */}
          <div className="space-y-2">
            <h3 className="text-xs font-black text-slate-900 dark:text-slate-200 uppercase tracking-widest">
              Nuestro Compromiso de Transparencia
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl">
              La misión Promocional de la Institución Educativa Nuestra Señora de la Salud orienta sus esfuerzos a la proyección cuidada, dirección y control riguroso de los ingresos y gastos acumulados, promoviendo una gestión efficiente que garantice la equidad y sostenibilidad de nuestros servicios educativos ordinarios.
            </p>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta Fotográfica de la Fachada */}
        <div className="md:col-span-5 flex justify-center">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 p-3 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl dark:shadow-slate-950/40 group transition-all duration-300">

            {/* Contenedor de la Imagen */}
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Image
                src="/images/pages/fachada_nss.webp"
                alt="Fachada de la Institución Educativa Nuestra Señora de la Salud"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 448px"
                className="object-cover group-hover:scale-102 transition-all duration-300 dark:brightness-85 dark:contrast-105"
              />

              {/* Etiqueta Flotante de Ubicación */}
              <div className="absolute bottom-3 left-3 right-3 bg-blue-900/90 dark:bg-slate-900/90 backdrop-blur-xs text-white text-xs py-2 px-3 rounded-xl flex items-center gap-2 shadow-md transition-colors duration-300">
                <span>📍</span>
                <span className="font-bold tracking-wide">Punchana, Iquitos</span>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
};

export default Home;