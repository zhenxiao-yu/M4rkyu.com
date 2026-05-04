import createNextIntlPlugin from "next-intl/plugin";
import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.VERCEL ? ".next" : ".next-node22",
  outputFileTracingRoot: process.cwd(),
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  images: {
    formats: ["image/avif", "image/webp"],
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
