"use client";

import { LOCALES, localeLabels, type Locale } from "@/lib/i18n";

type LocaleTabsProps = {
  activeLocale: Locale;
  onChange: (locale: Locale) => void;
  className?: string;
};

const LocaleTabs = ({ activeLocale, onChange, className = "" }: LocaleTabsProps) => {
  return (
    <div className={className}>
      <div
        className="inline-flex rounded-2xl border border-emerald-900/10 bg-emerald-950/5 p-1 shadow-sm dark:border-white/10 dark:bg-white/5"
        role="tablist"
        aria-label="Seleccionar idioma de edición"
      >
        {LOCALES.map((locale) => {
          const isActive = activeLocale === locale;

          return (
            <button
              key={locale}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(locale)}
              className={`rounded-xl px-4 py-2 text-xs font-black uppercase tracking-[0.14em] transition ${
                isActive
                  ? "bg-emerald-800 text-white shadow-sm dark:bg-emerald-500 dark:text-emerald-950"
                  : "text-slate-600 hover:bg-white hover:text-emerald-900 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-emerald-200"
              }`}
            >
              {localeLabels[locale]}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LocaleTabs;
