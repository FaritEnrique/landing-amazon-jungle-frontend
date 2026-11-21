"use client";

import { FaWhatsapp } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { getLocale } from "@/lib/i18n";
import { trackEvent } from "@/lib/analytics";

const FloatingWhatsApp = () => {
  const pathname = usePathname();
  const locale = getLocale(pathname?.split("/").filter(Boolean)[0]);
  const message =
    locale === "es"
      ? "Hola, quisiera recibir información sobre los tours y experiencias de Amazon Jungle Expeditions."
      : "Hello, I would like information about the tours and experiences from Amazon Jungle Expeditions.";
  const whatsappUrl = `https://wa.me/51922700988?text=${encodeURIComponent(message)}`;

  const handleClick = () => {
    trackEvent("click_whatsapp", {
      source: "floating_button",
      locale,
      page_path: pathname || "/",
      destination_url: whatsappUrl,
    });
  };

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={
        locale === "es"
          ? "Contactar por WhatsApp al +51 922700988"
          : "Contact via WhatsApp at +51 922700988"
      }
      onClick={handleClick}
      className="fixed bottom-4 right-4 z-[60] grid h-14 w-14 place-items-center rounded-full bg-[#25D366] text-white shadow-2xl shadow-black/30 transition hover:-translate-y-1 hover:bg-[#20bd5a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] sm:bottom-6 sm:right-6 print:hidden"
    >
      <FaWhatsapp className="h-8 w-8" aria-hidden="true" />
    </a>
  );
};

export default FloatingWhatsApp;
