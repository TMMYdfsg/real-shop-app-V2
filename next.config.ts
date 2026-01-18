import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true, // ビルド時のLintエラーを無視（移行用）
  },
};

export default nextConfig;
