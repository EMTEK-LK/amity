import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        fs: false,
        path: false,
        crypto: false,
      };
      config.resolve.fallback = {
        ...config.resolve.fallback,
        encoding: false,
      };
    }
    return config;
  },
};

export default nextConfig;
