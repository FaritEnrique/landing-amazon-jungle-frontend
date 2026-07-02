"use client";

type SharePlatform = "whatsapp" | "facebook" | "twitter";

interface ShareButtonsProps {
  title?: string;
  message?: string;
  url?: string;
}

const defaultShareMessage =
  "Discover Amazon Jungle Expeditions: authentic rainforest experiences departing from Iquitos, Peru.";

const openShareWindow = (shareUrl: string) => {
  window.open(shareUrl, "_blank", "noopener,noreferrer,width=720,height=640");
};

const ShareButtons = ({
  title = "Share this experience",
  message = defaultShareMessage,
  url,
}: ShareButtonsProps) => {
  const getShareUrl = () => {
    if (url) return url;

    if (typeof window !== "undefined") {
      return window.location.href;
    }

    return "";
  };

  const handleShare = (platform: SharePlatform) => {
    const currentUrl = getShareUrl();
    const encodedUrl = encodeURIComponent(currentUrl);
    const encodedMessage = encodeURIComponent(message);

    if (platform === "whatsapp") {
      openShareWindow(
        `https://api.whatsapp.com/send?text=${encodeURIComponent(
          `${message} ${currentUrl}`,
        )}`,
      );
      return;
    }

    if (platform === "facebook") {
      openShareWindow(
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      );
      return;
    }

    openShareWindow(
      `https://twitter.com/intent/tweet?text=${encodedMessage}&url=${encodedUrl}`,
    );
  };

  return (
    <section
      className="rounded-4xl border border-emerald-900/10 bg-white p-5 shadow-xl shadow-emerald-950/5 dark:border-white/10 dark:bg-slate-900 sm:p-6"
      aria-labelledby="share-experience-title"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2
            id="share-experience-title"
            className="text-base font-black tracking-tight text-slate-950 dark:text-white"
          >
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Invite friends and travelers to discover the Amazon from Iquitos.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleShare("whatsapp")}
            className="inline-flex items-center justify-center rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-white shadow-md transition hover:bg-emerald-700"
            aria-label="Share on WhatsApp"
          >
            WhatsApp
          </button>

          <button
            type="button"
            onClick={() => handleShare("facebook")}
            className="inline-flex items-center justify-center rounded-full bg-blue-700 px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-white shadow-md transition hover:bg-blue-800"
            aria-label="Share on Facebook"
          >
            Facebook
          </button>

          <button
            type="button"
            onClick={() => handleShare("twitter")}
            className="inline-flex items-center justify-center rounded-full bg-slate-950 px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-white shadow-md transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            aria-label="Share on Twitter"
          >
            Twitter / X
          </button>
        </div>
      </div>
    </section>
  );
};

export default ShareButtons;
