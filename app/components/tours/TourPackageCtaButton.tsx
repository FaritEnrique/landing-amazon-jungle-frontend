"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { trackEvent } from "@/lib/analytics";
import type { Locale } from "@/lib/i18n";

const isExternalUrl = (url: string) => {
  return url.startsWith("http://") || url.startsWith("https://");
};

type TourPackageCtaButtonProps = {
  href: string;
  label: string;
  packageId: number;
  packageTitle: string;
  locale: Locale;
};

const TourPackageCtaButton = ({
  href,
  label,
  packageId,
  packageTitle,
  locale,
}: TourPackageCtaButtonProps) => {
  const className =
    "mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-[#465c12] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white shadow-sm transition hover:bg-[#33440d]";

  const handleClick = () => {
    trackEvent("click_tour_package", {
      package_id: packageId,
      package_title: packageTitle,
      locale,
      destination_url: href,
      page_path: window.location.pathname,
    });
  };

  if (isExternalUrl(href)) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={className}
        onClick={handleClick}
      >
        {label}
        <ArrowRight size={14} aria-hidden="true" />
      </a>
    );
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {label}
      <ArrowRight size={14} aria-hidden="true" />
    </Link>
  );
};

export default TourPackageCtaButton;
