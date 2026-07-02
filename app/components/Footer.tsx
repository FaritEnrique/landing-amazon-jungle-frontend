"use client";

import React from "react";
import {
  FaWhatsapp,
  FaMapMarkerAlt,
  FaRegEnvelope,
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";

const Footer: React.FC = () => {
  return (
    /* Fondo verde oliva corporativo exacto de la imagen con transiciones */
    <footer className="w-full bg-[#465c12] text-white py-12 px-6 sm:px-12 md:px-24 mt-auto transition-colors duration-300 font-sans select-none relative">
      {/* Rejilla Superior: 3 Columnas principales */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
        {/* Columna 1: Contact */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-xs">
            <h3 className="font-dolphin text-3xl border-t border-b border-white/40 py-2 my-4 tracking-wide font-normal">
              Contact
            </h3>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm font-light text-zinc-200">
              <FaWhatsapp className="text-base shrink-0" />
              <span>+51 943214093 / 963736321</span>
            </div>
          </div>
        </div>

        {/* Columna 2: Find us */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-xs">
            <h3 className="font-dolphin text-3xl border-t border-b border-white/40 py-2 my-4 tracking-wide font-normal">
              Find us
            </h3>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm font-light text-zinc-200">
              <FaMapMarkerAlt className="text-base shrink-0" />
              <span>Pasaje Sargento Tejada #152 Iquitos</span>
            </div>
          </div>
        </div>

        {/* Columna 3: Write to us */}
        <div className="flex flex-col items-center">
          <div className="w-full max-w-xs">
            <h3 className="font-dolphin text-3xl border-t border-b border-white/40 py-2 my-4 tracking-wide font-normal">
              Write to us
            </h3>
            <div className="flex items-center justify-center gap-2 mt-4 text-sm font-light text-zinc-200">
              <FaRegEnvelope className="text-base shrink-0" />
              <a
                href="mailto:reservas@amazonjungle-expeditions.com"
                className="hover:underline break-all"
              >
                reservas@amazonjungle-expeditions.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Sección Inferior Centrada: Social Network */}
      <div className="max-w-7xl mx-auto mt-12 flex flex-col items-center">
        <div className="w-full max-w-xs text-center">
          <h3 className="font-dolphin text-3xl border-t border-b border-white/40 py-2 my-4 tracking-wide font-normal">
            Social Network
          </h3>

          {/* Botones de Redes Sociales apuntando a los enlaces oficiales */}
          <div className="flex justify-center gap-3 mt-6">
            <a
              href="https://www.facebook.com/profile.php?id=61582558462668&rdid=3Ks0b4lF9UjJ953f&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F177ohi6ZBm%2F#"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visitar nuestro Facebook"
              className="w-10 h-10 bg-zinc-400/80 hover:bg-zinc-300 text-zinc-800 flex items-center justify-center rounded transition-colors duration-200"
            >
              <FaFacebookF className="text-lg" />
            </a>
            <a
              href="https://www.instagram.com/aldofloreshidalgo123"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visitar nuestro Instagram"
              className="w-10 h-10 bg-zinc-400/80 hover:bg-zinc-300 text-zinc-800 flex items-center justify-center rounded transition-colors duration-200"
            >
              <FaInstagram className="text-lg" />
            </a>
            <a
              href="https://www.tiktok.com/@aldofh2025"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visitar nuestro TikTok"
              className="w-10 h-10 bg-zinc-400/80 hover:bg-zinc-300 text-zinc-800 flex items-center justify-center rounded transition-colors duration-200"
            >
              <FaTiktok className="text-lg" />
            </a>
            <a
              href="https://www.youtube.com/@amazonjungleexpeditionsloge?si=QlHVPIcGII2zoxe7"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Visitar nuestro canal de YouTube"
              className="w-10 h-10 bg-zinc-400/80 hover:bg-zinc-300 text-zinc-800 flex items-center justify-center rounded transition-colors duration-200"
            >
              <FaYoutube className="text-lg" />
            </a>
          </div>
        </div>
      </div>

      {/* Créditos de pie de página con el año dinámico */}
      <div className="text-center text-[10px] text-white/30 mt-12 pt-4 border-t border-white/10 max-w-7xl mx-auto">
        &copy; {new Date().getFullYear()} Amazon Jungle Expeditions.
      </div>
    </footer>
  );
};

export default Footer;
