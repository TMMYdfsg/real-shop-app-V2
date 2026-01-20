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
  // コンパイラによるコード圧縮を強制
  // swcMinify is default in Next 15
  // 画像最適化（外部画像を使う場合ドメイン指定必須）
  images: {
    domains: ['lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  // 実験的な最適化オプション（ビルドが通るなら有効化推奨）
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts', 'framer-motion'],
  },
};

export default nextConfig;
