"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  listPublicHeroSlides,
  resolveHeroImageUrl,
  type HeroSlide,
} from "@/lib/heroSlidesApi";

const fallbackSlides: HeroSlide[] = [
  {
    id: "fallback-amazon-hero",
    imageUrl: "/images/hero/amazon-hero-fallback.svg",
    altText: "Peruvian Amazon rainforest landscape",
    eyebrow: "Departing daily from Iquitos, Peru",
    titleBefore: "Explore the living",
    titleHighlight: "Amazon,",
    titleAfter: "guided by people who call it home",
    description:
      "Experience the rainforest from a family-run lodge, with authentic excursions, living nature, local culture and guides who know the jungle by heart.",
    primaryButtonText: "Reserve on WhatsApp",
    primaryButtonUrl:
      "https://wa.me/51943214093?text=Hello%20Amazon%20Jungle%20Expeditions%2C%20I%20would%20like%20to%20make%20a%20reservation.",
    backgroundPosition: "center center",
    sortOrder: 0,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const AUTOPLAY_DELAY = 6500;

const isExternalUrl = (url: string) => {
  return url.startsWith("http://") || url.startsWith("https://");
};

const HeroActionLink = ({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
}) => {
  const className = [
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-xs font-black uppercase tracking-[0.18em] shadow-lg transition sm:px-7",
    variant === "primary"
      ? "bg-amber-400 text-emerald-950 shadow-black/20 hover:bg-amber-300"
      : "border border-white/30 bg-white/10 text-white backdrop-blur-md hover:bg-white/20",
  ].join(" ");

  if (isExternalUrl(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
};

interface HeroCarouselProps {
  initialSlides?: HeroSlide[];
}

const HeroCarousel = ({
  initialSlides = fallbackSlides,
}: HeroCarouselProps) => {
  const [slides, setSlides] = useState<HeroSlide[]>(
    initialSlides.length > 0 ? initialSlides : fallbackSlides,
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(initialSlides.length === 0);

  const activeSlides = useMemo(() => {
    return slides.filter((slide) => slide.isActive && slide.imageUrl);
  }, [slides]);

  const currentSlide = activeSlides[currentIndex] || activeSlides[0];

  useEffect(() => {
    let isMounted = true;

    listPublicHeroSlides()
      .then((response) => {
        if (!isMounted) return;

        if (response.slides.length > 0) {
          setSlides(response.slides);
          setCurrentIndex(0);
        }
      })
      .catch(() => {
        if (!isMounted) return;

        setSlides(fallbackSlides);
      })
      .finally(() => {
        if (!isMounted) return;

        setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (activeSlides.length <= 1) {
      return;
    }

    const interval = window.setInterval(() => {
      setCurrentIndex((current) => (current + 1) % activeSlides.length);
    }, AUTOPLAY_DELAY);

    return () => window.clearInterval(interval);
  }, [activeSlides.length]);

  const goToPrevious = () => {
    if (activeSlides.length <= 1) return;

    setCurrentIndex((current) =>
      current === 0 ? activeSlides.length - 1 : current - 1,
    );
  };

  const goToNext = () => {
    if (activeSlides.length <= 1) return;

    setCurrentIndex((current) => (current + 1) % activeSlides.length);
  };

  if (!currentSlide) {
    return null;
  }

  const eyebrow = currentSlide.eyebrow?.trim();
  const titleBefore = currentSlide.titleBefore?.trim();
  const titleAfter = currentSlide.titleAfter?.trim();
  const titleHighlight = currentSlide.titleHighlight?.trim();
  const description = currentSlide.description?.trim();

  const hasTitle = Boolean(titleBefore || titleHighlight || titleAfter);

  const hasPrimaryButton = Boolean(
    currentSlide.primaryButtonText?.trim() &&
    currentSlide.primaryButtonUrl?.trim(),
  );

  const hasOverlayContent = Boolean(
    eyebrow || hasTitle || description || hasPrimaryButton,
  );

  const backgroundImageUrl = resolveHeroImageUrl(currentSlide.imageUrl);

  return (
    <section
      className="relative isolate min-h-svh overflow-hidden bg-emerald-950 bg-cover bg-center text-white transition-[background-image] duration-700"
      style={{
        backgroundImage: `url("${backgroundImageUrl}")`,
        backgroundPosition: currentSlide.backgroundPosition || "center center",
      }}
      role="region"
      aria-roledescription="carousel"
      aria-label="Main carousel"
    >
      <span className="sr-only">{currentSlide.altText}</span>

      {hasOverlayContent && (
        <div className="mx-auto flex min-h-svh max-w-7xl items-center px-4 pb-16 pt-36 sm:px-6 lg:pb-20 lg:pt-44">
          <div className="max-w-4xl animate-fade-in">
            {eyebrow && (
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-amber-400 px-4 py-2 text-[11px] font-black uppercase tracking-wide text-emerald-900 shadow-lg shadow-black/10 backdrop-blur-md sm:text-xs">
                <MapPin size={14} aria-hidden="true" />
                {eyebrow}
              </div>
            )}

            {hasTitle && (
              <h1 className="font-display text-4xl font-black leading-[1.04] tracking-tight text-slate-950 drop-shadow-xl sm:text-5xl md:text-6xl lg:text-7xl">
                {titleBefore}
                {titleHighlight && (
                  <>
                    {titleBefore && <br />}
                    <span className="text-amber-400">{titleHighlight}</span>
                  </>
                )}
                {titleAfter && <> {titleAfter}</>}
              </h1>
            )}

            {description && (
              <p className="mt-6 max-w-2xl text-sm font-medium leading-7 text-slate-900 drop-shadow sm:text-base md:text-lg md:leading-8">
                {description}
              </p>
            )}

            {hasPrimaryButton && currentSlide.primaryButtonUrl && (
              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {hasPrimaryButton && currentSlide.primaryButtonUrl && (
                  <HeroActionLink href={currentSlide.primaryButtonUrl}>
                    {currentSlide.primaryButtonText}
                  </HeroActionLink>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute bottom-8 right-24 hidden h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 text-white shadow-lg backdrop-blur-md transition hover:bg-white/20 md:grid"
            aria-label="Previous carousel image"
          >
            <ChevronLeft size={20} aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={goToNext}
            className="absolute bottom-8 right-10 hidden h-11 w-11 place-items-center rounded-full border border-white/25 bg-white/10 text-white shadow-lg backdrop-blur-md transition hover:bg-white/20 md:grid"
            aria-label="Siguiente imagen del carrusel"
          >
            <ChevronRight size={20} aria-hidden="true" />
          </button>

          <div
            className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2 md:left-auto md:right-40 md:translate-x-0"
            aria-label="Carousel slide selector"
          >
            {activeSlides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === currentIndex
                    ? "w-8 bg-amber-400"
                    : "w-2.5 bg-white/50 hover:bg-white/80"
                }`}
                aria-label={`Go to slide ${index + 1}`}
                aria-current={index === currentIndex ? "true" : undefined}
              />
            ))}
          </div>
        </>
      )}

      {isLoading && (
        <div className="pointer-events-none absolute bottom-8 left-4 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white/70 backdrop-blur-md sm:left-6">
          Loading carousel...
        </div>
      )}
    </section>
  );
};

export default HeroCarousel;
