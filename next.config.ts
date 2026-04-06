import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {},
  typescript: {
    // Skip the built-in SWC type checker — use tsc separately if needed
    ignoreBuildErrors: true,
  },
};

export default nextConfig;