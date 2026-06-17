import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Covers are pre-sized video frames used as blurred backdrops + circle crops;
  // the optimizer adds no value here and the Turbopack dev optimizer mis-handles them.
  // Serve them as-is.
  images: { unoptimized: true },
};

export default nextConfig;
