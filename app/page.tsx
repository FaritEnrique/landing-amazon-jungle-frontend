import HeroCarousel from "./components/HeroCarousel";
import ShareButtons from "./components/ShareButtons";

const Home = () => {
  return (
    <main className="w-full bg-stone-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
      <HeroCarousel />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-emerald-700 dark:text-emerald-400">
              Amazon Jungle Expeditions
            </p>

            <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 dark:text-white sm:text-4xl lg:text-5xl">
              Experience the Amazon from Iquitos
            </h1>

            <p className="mt-5 text-base leading-8 text-slate-600 dark:text-slate-300 sm:text-lg">
              Discover the rainforest through guided excursions, authentic
              experiences, living nature and local hospitality from our jungle
              lodge.
            </p>
          </div>

          <div className="space-y-5">
            <ShareButtons />
          </div>
        </div>
      </section>
      <section></section>
    </main>
  );
};

export default Home;
