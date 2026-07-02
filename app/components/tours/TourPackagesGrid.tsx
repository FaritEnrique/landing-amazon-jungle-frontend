"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  listarTourPackages,
  resolveTourPackageImageUrl,
} from "@/lib/tourPackagesApi";
import type { TourPackage } from "./tourPackageTypes";

const isExternalUrl = (url: string) => {
  return url.startsWith("http://") || url.startsWith("https://");
};

const TourPackageButton = ({ href, label }: { href: string; label: string }) => {
  const className =
    "mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#465c12] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-[#33440d]";

  if (isExternalUrl(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {label}
        <ArrowRight size={14} aria-hidden="true" />
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
      <ArrowRight size={14} aria-hidden="true" />
    </Link>
  );
};

const TourPackagesGrid = () => {
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    listarTourPackages(false)
      .then((data) => {
        if (!isMounted) return;
        setPackages(data);
      })
      .catch(() => {
        if (!isMounted) return;
        setPackages([]);
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const activePackages = useMemo(() => {
    return packages
      .filter((pkg) => pkg.active && pkg.imageWebpUrl)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);
  }, [packages]);

  if (isLoading) {
    return (
      <section id="excursions" className="w-full bg-[#465c12]/10 px-4 py-12">
        <div className="mx-auto max-w-7xl rounded-3xl border border-emerald-100 bg-white/70 p-8 text-center text-sm font-semibold text-slate-500 shadow-sm dark:border-emerald-900/30 dark:bg-slate-900/70 dark:text-slate-400">
          Cargando paquetes turísticos...
        </div>
      </section>
    );
  }

  if (activePackages.length === 0) {
    return null;
  }

  return (
    <section id="excursions" className="w-full bg-[#465c12]/10 px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-800 dark:text-emerald-400">
            Amazon Jungle Expeditions
          </p>

          <h2 className="mt-3 font-display text-3xl font-black tracking-tight text-emerald-950 dark:text-white sm:text-4xl">
            Choose your Amazon experience
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {activePackages.map((pkg) => {
            const hasButton = Boolean(pkg.buttonLabel?.trim() && pkg.buttonHref?.trim());

            return (
              <article
                key={pkg.id}
                className="overflow-hidden rounded-sm border-4 border-[#465c12] bg-[#f7f2df] shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900"
              >
                <div className="group relative aspect-square w-full overflow-hidden bg-zinc-900">
                  <img
                    src={resolveTourPackageImageUrl(pkg.imageWebpUrl)}
                    alt={pkg.imageAlt || pkg.overlayTitle}
                    className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-black/30 transition-colors duration-300 group-hover:bg-black/10" />

                  <div className="absolute inset-0 flex select-none flex-col items-center justify-center p-4 text-center text-white transition-opacity duration-500 ease-in-out group-hover:opacity-0">
                    <p className="font-dolphin text-xl leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] md:text-2xl">
                      {pkg.duration}
                    </p>

                    <p className="font-dolphin mt-1 text-xl leading-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] md:text-2xl">
                      {pkg.overlayTitle}
                    </p>

                    <p className="mt-4 font-sans text-lg font-bold tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] md:text-xl">
                      {pkg.price}
                    </p>
                  </div>
                </div>

                <div className="flex min-h-[220px] flex-col px-4 py-5 text-center">
                  <h3 className="text-base font-black leading-snug text-[#465c12] dark:text-emerald-300">
                    {pkg.bottomTitle}
                  </h3>

                  {pkg.bottomDescription ? (
                    <p className="mt-3 flex-1 text-sm leading-6 text-slate-700 dark:text-slate-300">
                      {pkg.bottomDescription}
                    </p>
                  ) : (
                    <div className="flex-1" />
                  )}

                  {hasButton && pkg.buttonLabel && pkg.buttonHref ? (
                    <TourPackageButton href={pkg.buttonHref} label={pkg.buttonLabel} />
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TourPackagesGrid;
