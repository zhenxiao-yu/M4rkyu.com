import createNextIntlPlugin from "next-intl/plugin";
import createMDX from "@next/mdx";
import nextBundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? (process.env.VERCEL ? ".next" : ".next-node22"),
  outputFileTracingRoot: process.cwd(),
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
  // PR #59 route migration — preserve inbound links to the previous
  // /projects, /gallery, /blog URLs (and their slug children) by
  // issuing 308 permanent redirects to the renamed segments. Both
  // the bare paths (handled by next-intl's locale prefix rewrite
  // afterwards) and the explicit /:locale forms (direct hits from
  // external links) are covered so search engines, RSS readers, and
  // shared dev.to URLs all land on the new destination without a
  // 404 hop.
  async redirects() {
    return [
      // /projects → /work
      { source: "/projects", destination: "/work", permanent: true },
      { source: "/projects/:slug*", destination: "/work/:slug*", permanent: true },
      { source: "/:locale(en|zh)/projects", destination: "/:locale/work", permanent: true },
      {
        source: "/:locale(en|zh)/projects/:slug*",
        destination: "/:locale/work/:slug*",
        permanent: true,
      },
      // /gallery → /archive  (dynamic segment is /[collection])
      { source: "/gallery", destination: "/archive", permanent: true },
      {
        source: "/gallery/:collection*",
        destination: "/archive/:collection*",
        permanent: true,
      },
      { source: "/:locale(en|zh)/gallery", destination: "/:locale/archive", permanent: true },
      {
        source: "/:locale(en|zh)/gallery/:collection*",
        destination: "/:locale/archive/:collection*",
        permanent: true,
      },
      // /blog → /logs
      { source: "/blog", destination: "/logs", permanent: true },
      { source: "/blog/:slug*", destination: "/logs/:slug*", permanent: true },
      { source: "/:locale(en|zh)/blog", destination: "/:locale/logs", permanent: true },
      {
        source: "/:locale(en|zh)/blog/:slug*",
        destination: "/:locale/logs/:slug*",
        permanent: true,
      },
    ];
  },
  compiler: {
    // Strip dev logs from production client bundles. Keep errors and
    // warnings so real problems still surface in the browser console.
    removeConsole: { exclude: ["error", "warn"] },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    // 1 year cache for optimized AVIF/WebP — Next's default 60s is too short
    // for static portfolio assets that change only at deploy time.
    minimumCacheTTL: 31536000,
    // Dev.to-syndicated post bodies (Phase 8.2) reference images
    // hosted on Forem's CDN and the underlying S3 bucket. Any new
    // upstream image host added here must be a known, trusted CDN.
    remotePatterns: [
      { protocol: "https", hostname: "media.dev.to" },
      { protocol: "https", hostname: "media2.dev.to" },
      { protocol: "https", hostname: "media3.dev.to" },
      { protocol: "https", hostname: "dev-to-uploads.s3.amazonaws.com" },
      // Supabase Storage CDN for the gallery-images bucket. Single
      // hostname per Supabase project, wildcard covers any project ref.
      { protocol: "https", hostname: "*.supabase.co" },
      // Steam profile avatars for the compact about-page signal card.
      { protocol: "https", hostname: "avatars.steamstatic.com" },
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
// Wrap last so it sees the fully composed config. Runs only when
// `ANALYZE=true` is set (via the `analyze` npm script); otherwise it's
// a no-op and the build runs identically to before.
const withBundleAnalyzer = nextBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

export default withBundleAnalyzer(withNextIntl(withMDX(nextConfig)));
