import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Force the compiler to pack everything neatly into a dedicated standalone server file tree
  output: "standalone",
  
  // 2. Disable asset optimization flags so Hostinger can read static assets directly
  images: {
    unoptimized: true,
  },
  
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;