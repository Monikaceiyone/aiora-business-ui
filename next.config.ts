import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Remove middleware since we're separating frontend/backend
  experimental: {
    // Enable any experimental features if needed
  },
};

export default nextConfig;