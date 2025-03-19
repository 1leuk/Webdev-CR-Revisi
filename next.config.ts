import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // Add other image hostnames if needed (e.g., for other external image sources)
    ],
  },
};

export default nextConfig;