export type AnalyticsEventName =
  | "click_whatsapp"
  | "click_share_whatsapp"
  | "click_share_facebook"
  | "click_share_x"
  | "click_tour_package"
  | "language_switch";

type AnalyticsPrimitive = string | number | boolean | null | undefined;
export type AnalyticsEventParams = Record<string, AnalyticsPrimitive>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const sanitizeParams = (params: AnalyticsEventParams) => {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined),
  );
};

export const trackEvent = (
  eventName: AnalyticsEventName,
  params: AnalyticsEventParams = {},
) => {
  if (typeof window === "undefined") return;

  const eventParams = sanitizeParams(params);

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...eventParams,
  });

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, eventParams);
  }
};
