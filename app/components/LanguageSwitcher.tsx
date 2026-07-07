"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { alternateLocale, buildLocalizedPath, copy, getLocale } from "@/lib/i18n";

const LanguageSwitcher = () => {
  const pathname = usePathname() || "/en";
  const firstSegment = pathname.split("/").filter(Boolean)[0];

  if (firstSegment !== "en" && firstSegment !== "es") {
    return null;
  }

  const locale = getLocale(firstSegment);
  const nextLocale = alternateLocale(locale);
  const nextPath = buildLocalizedPath(nextLocale, pathname);

  return (
    <div className="fixed bottom-4 left-4 z-50 sm:bottom-6 sm:left-6 print:hidden">
      <Link
        href={nextPath}
        className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-emerald-950/90 px-3 py-2 text-[11px] font-black uppercase tracking-[0.16em] text-white shadow-2xl shadow-black/25 backdrop-blur-md transition hover:bg-emerald-800 sm:px-4 sm:py-2.5"
        aria-label={`Switch language to ${copy[locale].switchTo}`}
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-amber-400 text-[10px] text-emerald-950">
          {nextLocale.toUpperCase()}
        </span>
        <span className="hidden sm:inline">{copy[locale].switchTo}</span>
      </Link>
    </div>
  );
};

export default LanguageSwitcher;
