"use client";

import Image from "next/image";
import Link from "next/link";
import { Menu, Phone, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { FaHome, FaInstagram, FaYoutube } from "react-icons/fa";
import { useEffect, useState } from "react";
import { LuNetwork } from "react-icons/lu";
import { copy, getLocale } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";

const MAIN_SITE_URL =
  process.env.NEXT_PUBLIC_MAIN_SITE_URL ||
  "https://www.amazonjungle-expeditions.com";

const LANDING_SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://landing.amazonjungle-expeditions.com";

const Header = () => {
  const pathname = usePathname();
  const locale = getLocale(pathname?.split("/").filter(Boolean)[0]);
  const t = copy[locale];

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hasScrolled, setHasScrolled] = useState(false);

  const isHomePage = pathname === "/" || pathname === `/${locale}`;
  const isOverlayHeader = isHomePage && !hasScrolled && !isMenuOpen;
  const landingLabel =
    locale === "es" ? "Ir a la pÃ¡gina landing" : "Go to landing home";

  const handleWhatsAppClick = (source: string) => {
    trackEvent("click_whatsapp", {
      source,
      locale,
      page_path: pathname || "/",
      destination_url: "https://wa.me/51943214093",
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 40);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      <header className="fixed left-0 top-0 z-50 w-full font-sans">
        {/* Barra superior */}
        <div
          className={[
            "hidden border-b text-white transition-all duration-300 lg:block",
            isOverlayHeader
              ? "border-lime-800/30 bg-lime-700/95"
              : "border-emerald-900/20 bg-emerald-950",
          ].join(" ")}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs font-bold">
            <Link
              href="https://wa.me/51943214093"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 tracking-wide text-emerald-50 transition hover:text-white"
              onClick={() => handleWhatsAppClick("header_desktop")}
            >
              <Phone size={15} />
              {locale === "es" ? "RESERVAR" : "BOOK"} (+51) 943214093 /
              937069135 / 963736321
            </Link>

            <div className="flex items-center gap-4">
              <Link
                href="https://www.instagram.com/aldofloreshidalgo123"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="flex items-center gap-1 text-white/90 transition hover:text-white"
              >
                <FaInstagram size={16} />
                <span>Instagram</span>
              </Link>

              <Link
                href="https://www.youtube.com/@amazonjungleexpeditionsloge?si=QlHVPIcGII2zoxe7"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="flex items-center gap-1 text-white/90 transition hover:text-white"
              >
                <FaYoutube size={17} />
                <span>YouTube</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Header principal */}
        <div
          className={[
            "transition-all duration-300",
            isOverlayHeader
              ? "border-transparent bg-transparent text-white"
              : "border-b border-emerald-900/10 bg-white/95 text-slate-900 shadow-sm backdrop-blur-xl",
          ].join(" ")}
        >
          <div
            className={[
              "mx-auto flex max-w-7xl items-center justify-between px-4 transition-all duration-300 sm:px-6",
              isOverlayHeader ? "py-4 lg:py-5" : "py-3 lg:py-4",
            ].join(" ")}
          >
            <Link href={MAIN_SITE_URL} className="flex items-center gap-3">
              <div
                className={[
                  "relative overflow-hidden rounded-full transition-all duration-300",
                  isOverlayHeader
                    ? "h-14 w-14 bg-white/10 ring-2 ring-white/40 lg:h-20 lg:w-20"
                    : "h-12 w-12 bg-transparent shadow-md ring-2 ring-emerald-700/20 lg:h-14 lg:w-14",
                ].join(" ")}
              >
                <Image
                  src="/images/logos/Logo-sbg.webp"
                  alt="Amazon Jungle Expeditions Lodge"
                  fill
                  sizes="(max-width: 1024px) 56px, 80px"
                  className="object-cover"
                  priority
                />
              </div>

              <div className="leading-tight">
                <p
                  className={[
                    "font-sans text-lg font-extrabold transition-colors sm:text-xl",
                    isOverlayHeader
                      ? "text-white drop-shadow"
                      : "text-emerald-950",
                  ].join(" ")}
                >
                  {/* <TextoContorno
                    grosor={isOverlayHeader ? "0px" : "0.7px"}
                    colorBorde="rgba(255,255,255,0.85)"
                    className="font-extrabold"
                  > */}
                  Amazon Jungle
                  {/* </TextoContorno> */}
                </p>

                <p
                  className={[
                    "font-sans text-lg font-extrabold transition-colors sm:text-xl",
                    isOverlayHeader
                      ? "text-white drop-shadow"
                      : "text-emerald-950",
                  ].join(" ")}
                >
                  Expeditions Lodge
                </p>
              </div>
            </Link>

            {/* AcciÃ³n desktop */}
            <div className="hidden items-center gap-3 lg:flex">
              <Link
                href={LANDING_SITE_URL}
                aria-label={landingLabel}
                title={landingLabel}
                className={[
                  "inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-black shadow-lg transition",
                  isOverlayHeader
                    ? "bg-white text-emerald-900 shadow-black/20 hover:bg-emerald-50"
                    : "bg-emerald-100 text-emerald-900 shadow-emerald-900/10 hover:bg-emerald-200",
                ].join(" ")}
              >
                <FaHome size={20} aria-hidden="true" />
              </Link>

              <Link
                href="/login"
                aria-label={t.intranet}
                title={t.intranet}
                className={[
                  "inline-flex h-11 w-11 items-center justify-center rounded-full text-sm font-black shadow-lg transition",
                  isOverlayHeader
                    ? "bg-white text-emerald-900 shadow-black/20 hover:bg-emerald-50"
                    : "bg-emerald-700 text-white shadow-emerald-900/15 hover:bg-emerald-800",
                ].join(" ")}
              >
                <LuNetwork size={22} aria-hidden="true" />
              </Link>
            </div>

            {/* BotÃ³n mÃ³vil */}
            <button
              type="button"
              aria-label={isMenuOpen ? t.closeMenu : t.openMenu}
              onClick={() => setIsMenuOpen((current) => !current)}
              className={[
                "grid h-11 w-11 place-items-center rounded-full border transition lg:hidden",
                isOverlayHeader
                  ? "border-white/40 bg-black/10 text-white backdrop-blur-md"
                  : "border-slate-200 bg-white text-slate-800",
              ].join(" ")}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* MenÃº mÃ³vil */}
          {isMenuOpen && (
            <div className="border-t border-slate-100 bg-white px-4 py-4 shadow-xl lg:hidden">
              <nav className="flex flex-col gap-1 text-sm font-bold text-slate-700">
                <Link
                  href={LANDING_SITE_URL}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-emerald-700 transition hover:bg-emerald-50"
                >
                  <FaHome size={17} aria-hidden="true" />
                  {locale === "es" ? "Landing" : "Home"}
                </Link>

                <Link
                  href="https://wa.me/51943214093"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    handleWhatsAppClick("header_mobile");
                    setIsMenuOpen(false);
                  }}
                  className="rounded-xl px-4 py-3 text-emerald-700 transition hover:bg-emerald-50"
                >
                  {t.reserveWhatsapp}
                </Link>

                <Link
                  href="https://www.instagram.com/aldofloreshidalgo123"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 transition hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <FaInstagram size={16} />
                  Instagram
                </Link>

                <Link
                  href="https://www.youtube.com/@amazonjungleexpeditionsloge?si=QlHVPIcGII2zoxe7"
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 transition hover:bg-emerald-50 hover:text-emerald-700"
                >
                  <FaYoutube size={17} />
                  YouTube
                </Link>

                <Link
                  href="/login"
                  aria-label={t.intranet}
                  title={t.intranet}
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-3 flex items-center justify-center gap-2 rounded-full bg-emerald-700 px-5 py-3 text-center font-black uppercase tracking-wide text-white transition hover:bg-emerald-800"
                >
                  <LuNetwork size={18} aria-hidden="true" />
                  <span>{t.intranet}</span>
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {!isHomePage && (
        <div className="h-[76px] lg:h-[118px]" aria-hidden="true" />
      )}
    </>
  );
};

export default Header;
