import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static file serving for data files
  async rewrites() {
    return [
      {
        source: '/api/data/:path*',
        destination: '/src/data/:path*',
      },
    ];
  },
  // Ensure data files are included in build
  webpack: (config) => {
    config.module.rules.push({
      test: /\.json$/,
      type: 'asset/resource',
    });
    return config;
  },
  // Disable ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
