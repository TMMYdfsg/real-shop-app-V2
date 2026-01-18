import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true, // ビルド時のLintエラーを無視（移行用）
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // PrismaClientの外部化を防ぐ
      config.externals = config.externals || [];
      config.externals.push({
        '@prisma/client': 'commonjs @prisma/client',
      });
    }
    return config;
  },
};

export default nextConfig;
