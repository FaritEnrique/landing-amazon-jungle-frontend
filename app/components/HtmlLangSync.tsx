"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { copy, getLocale } from "@/lib/i18n";

const HtmlLangSync = () => {
  const pathname = usePathname();

  useEffect(() => {
    const firstSegment = pathname.split("/").filter(Boolean)[0];
    const locale = getLocale(firstSegment);

    document.documentElement.lang = copy[locale].htmlLang;
  }, [pathname]);

  return null;
};

export default HtmlLangSync;
