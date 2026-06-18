import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site (4 prerendered pages, no API routes) → export to plain
  // HTML/CSS/JS in `out/` for static hosting (Cloudflare Pages).
  output: 'export',

  // Covers are pre-sized video frames used as blurred backdrops + circle crops;
  // the optimizer adds no value here and the Turbopack dev optimizer mis-handles them.
  // The default image loader isn't available in a static export anyway.
  images: { unoptimized: true },
};

export default nextConfig;
