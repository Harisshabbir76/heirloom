import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Force the compiler to pack everything neatly into a dedicated standalone server file tree
  output: "standalone",
  
  // 2. Whitelist Cloudinary so Next.js can optimize your luxury imagery on the fly
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;