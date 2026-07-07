import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
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

const getPublicTourPackages = async () => {
  try {
    return await listarTourPackages(false, {
      cache: "force-cache",
      next: {
        revalidate: 300,
      },
    });
  } catch {
    return [];
  }
};

const TourPackagesGrid = async () => {
  const packages = await getPublicTourPackages();

  const activePackages = packages
    .filter((pkg) => pkg.active && pkg.imageWebpUrl)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.id - b.id);

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

          <p className="mx-auto mt-3 max-w-3xl text-sm leading-7 text-slate-700 dark:text-slate-300 sm:text-base">
            Guided tours and lodge-based rainforest experiences from Iquitos,
            designed for travelers looking for nature, culture and authentic
            Amazonian hospitality.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
          {activePackages.map((pkg: TourPackage) => {
            const hasButton = Boolean(pkg.buttonLabel?.trim() && pkg.buttonHref?.trim());
            const imageAlt = pkg.seoAltText || pkg.imageAlt || pkg.overlayTitle;
            const description = pkg.excerpt || pkg.bottomDescription;

            return (
              <article
                key={pkg.id}
                className="overflow-hidden rounded-sm border-4 border-[#465c12] bg-[#f7f2df] shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900"
                itemScope
                itemType="https://schema.org/TouristTrip"
              >
                <div className="group relative aspect-square w-full overflow-hidden bg-zinc-900">
                  <Image
                    src={resolveTourPackageImageUrl(pkg.imageWebpUrl)}
                    alt={imageAlt}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                    itemProp="image"
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

                <div className="flex min-h-[250px] flex-col px-4 py-5 text-center">
                  <h3
                    className="text-base font-black leading-snug text-[#465c12] dark:text-emerald-300"
                    itemProp="name"
                  >
                    {pkg.bottomTitle}
                  </h3>

                  {description ? (
                    <p
                      className="mt-3 flex-1 text-sm leading-6 text-slate-700 dark:text-slate-300"
                      itemProp="description"
                    >
                      {description}
                    </p>
                  ) : (
                    <div className="flex-1" />
                  )}

                  {pkg.location ? (
                    <p className="mt-3 inline-flex items-center justify-center gap-1 text-[11px] font-black uppercase tracking-wide text-emerald-900 dark:text-emerald-300">
                      <MapPin size={13} aria-hidden="true" />
                      <span itemProp="touristType">{pkg.location}</span>
                    </p>
                  ) : null}

                  {pkg.priceAmount ? (
                    <meta itemProp="price" content={String(pkg.priceAmount)} />
                  ) : null}
                  {pkg.priceCurrency ? (
                    <meta itemProp="priceCurrency" content={pkg.priceCurrency} />
                  ) : null}

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
