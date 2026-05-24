import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. DO NOT use output: "export". Let Next.js run its native server bundle.
  
  // 2. Optimizes how image assets are served from the local /public folder on Hostinger
  images: {
    unoptimized: true, 
  },
  
  // 3. Helps Hostinger's proxy map your frontend URLs cleanly to the right directories
  trailingSlash: true,
  
  reactStrictMode: true,
};

export default nextConfig;