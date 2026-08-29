import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@archai/building-model',
    '@archai/geometry',
    '@archai/optimizer',
    '@archai/boq',
    '@archai/compliance',
    '@archai/shared',
    'three',
  ],
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: 'canvas' }];
    return config;
  },
};

export default nextConfig;
