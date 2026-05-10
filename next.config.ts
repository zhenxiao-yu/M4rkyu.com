import createNextIntlPlugin from "next-intl/plugin";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? (process.env.VERCEL ? ".next" : ".next-node22"),
  outputFileTracingRoot: process.cwd(),
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    formats: ["image/avif", "image/webp"],
    // Dev.to-syndicated post bodies (Phase 8.2) reference images
    // hosted on Forem's CDN and the underlying S3 bucket. Any new
    // upstream image host added here must be a known, trusted CDN.
    remotePatterns: [
      { protocol: "https", hostname: "media.dev.to" },
      { protocol: "https", hostname: "media2.dev.to" },
      { protocol: "https", hostname: "media3.dev.to" },
      { protocol: "https", hostname: "dev-to-uploads.s3.amazonaws.com" },
    ],
  },
  experimental: {
    cpus: 1,
    workerThreads: false,
    webpackBuildWorker: false,
    parallelServerBuildTraces: false,
  },
  webpack(config) {
    config.cache = false;
    config.resolve.symlinks = false;
    config.snapshot = {
      ...config.snapshot,
      managedPaths: [],
      immutablePaths: [],
    };
    return config;
  },
};

const withNextIntl = createNextIntlPlugin();
const withMDX = createMDX({});

export default withNextIntl(withMDX(nextConfig));
