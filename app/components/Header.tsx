"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChevronDown,
  Menu,
  Phone,
  Search,
  ShoppingCart,
  X,
} from "lucide-react";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { useState } from "react";


const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full font-sans">
      {/* Barra superior */}
      <div className="hidden border-b border-emerald-800/40 bg-emerald-950 text-white lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs font-medium">
          <div className="flex items-center gap-4">
            <Link
              href="https://www.instagram.com/aldofloreshidalgo123"
              target="_blank"
              className="flex items-center gap-1 text-white/80 transition hover:text-emerald-300"
            >
              <FaInstagram size={15} />
              Instagram
            </Link>

            <Link
              href="https://www.youtube.com/@amazonjungleexpeditionsloge?si=QlHVPIcGII2zoxe7"
              target="_blank"
              className="flex items-center gap-1 text-white/80 transition hover:text-emerald-300"
            >
              <FaYoutube size={16} />
              YouTube
            </Link>
          </div>

          <Link
            href="https://wa.me/51943214093"
            target="_blank"
            className="flex items-center gap-2 tracking-wide text-emerald-100 transition hover:text-white"
          >
            <Phone size={15} />
            RESERVAR (+51) 943214093 / 937069135 / 963736321
          </Link>
        </div>
      </div>

      {/* Header principal */}
      <div className="border-b border-emerald-900/10 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-12 w-12 overflow-hidden rounded-full bg-emerald-950 shadow-md ring-2 ring-emerald-700/20 lg:h-14 lg:w-14">
              <Image
                src="/images/logos/Logo-sbg.webp"
                alt="Amazon Jungle Expeditions"
                fill
                sizes="56px"
                className="object-contain p-1"
                priority
              />
            </div>

            <div className="leading-tight">
              <p className="font-display text-lg font-bold text-emerald-950 sm:text-xl">
                Amazon Jungle
              </p>
              <p className="font-display text-lg font-bold text-emerald-950 sm:text-xl">
                Expeditions
              </p>
            </div>
          </Link>

          {/* Acciones desktop */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="https://wa.me/51943214093"
              target="_blank"
              className="rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-800"
            >
              Intranet
            </Link>
          </div>

          {/* Botón móvil */}
          <button
            type="button"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setIsMenuOpen((current) => !current)}
            className="grid h-11 w-11 place-items-center rounded-full border border-slate-200 text-slate-800 lg:hidden"
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Menú móvil */}
        {isMenuOpen && (
          <div className="border-t border-slate-100 bg-white px-4 py-4 shadow-xl lg:hidden">
            <nav className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
              
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;