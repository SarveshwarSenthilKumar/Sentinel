import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname, ".."),
  
  // Production optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // CORS handling for API routes
  async rewrites() {
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL ??
      "https://sentinel-h2ef.onrender.com";
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/api/:path*`,
      },
    ];
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
