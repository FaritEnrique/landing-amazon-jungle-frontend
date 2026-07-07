import type { NextConfig } from "next";

type RemotePattern = {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
};

const createRemotePattern = (rawUrl?: string): RemotePattern | null => {
  if (!rawUrl) return null;

  try {
    const url = new URL(rawUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port || undefined,
      pathname: "/**",
    };
  } catch {
    return null;
  }
};

const configuredRemotePatterns = [
  createRemotePattern(process.env.NEXT_PUBLIC_API_URL),
  createRemotePattern(process.env.NEXT_PUBLIC_SITE_URL),
  createRemotePattern(process.env.NEXT_PUBLIC_MAIN_SITE_URL),
].filter((pattern): pattern is RemotePattern => Boolean(pattern));

const fallbackRemotePatterns: RemotePattern[] = [
  {
    protocol: "https",
    hostname: "landing.amazonjungle-expeditions.com",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "www.amazonjungle-expeditions.com",
    pathname: "/**",
  },
  {
    protocol: "https",
    hostname: "amazonjungle-expeditions.com",
    pathname: "/**",
  },
  {
    protocol: "http",
    hostname: "localhost",
    port: "3001",
    pathname: "/**",
  },
  {
    protocol: "http",
    hostname: "127.0.0.1",
    port: "3001",
    pathname: "/**",
  },
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [...configuredRemotePatterns, ...fallbackRemotePatterns],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;